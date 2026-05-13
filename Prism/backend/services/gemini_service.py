import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)

_STOPWORDS = frozenset({
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "is", "are", "was", "were", "has", "have", "had",
    "this", "that", "from", "its", "it", "be", "as", "up", "do", "if",
    "he", "she", "they", "we", "you", "i", "their", "our", "his", "her",
    "not", "will", "would", "could", "should", "about", "who", "what",
    "over", "after", "into", "than", "then", "when",
})


def extract_search_query(title: str) -> str:
    """
    Ask Gemini to split the headline into entities (proper nouns: people,
    places, orgs) and context (descriptive words). Build a NewsAPI query of
    the form (entities OR'd) AND (context OR'd) so the entities are required
    and the context boosts relevance without narrowing too far.
    Falls back to stopword-filtered title keywords if Gemini is unavailable.
    """
    if not GEMINI_API_KEY:
        return _fallback_query(title)

    prompt = (
        "Read the news headline below and identify two groups of search terms.\n"
        "ENTITIES: 1-3 specific proper nouns — people, places, organizations, "
        "or named events that uniquely identify this story.\n"
        "CONTEXT: 4-6 descriptive words or short phrases (verbs, topics, "
        "objects) that describe what happened, NOT including the entities above. "
        "Order them from most-specific to least-specific.\n"
        "Return exactly two lines in this format with no extra text:\n"
        "ENTITIES: term1, term2\n"
        "CONTEXT: term1, term2, term3, term4\n\n"
        f"Headline: {title}\n"
    )

    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.post(
                GEMINI_URL,
                params={"key": GEMINI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.1, "maxOutputTokens": 140},
                },
            )
            resp.raise_for_status()
            data = resp.json()

        raw = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        print(f"[gemini] raw output: {raw}")
        entities, context = _parse_entity_context(raw)
        if entities or context:
            query = _build_operator_query(entities, context)
            print(f"[gemini] operator query sent to API: {query}")
            return query
        return _fallback_query(title)
    except Exception as exc:
        print(f"gemini_service: keyword extraction failed ({exc}) — using fallback")
        return _fallback_query(title)


def _parse_entity_context(raw: str) -> tuple[list[str], list[str]]:
    """Parse Gemini's two-line ENTITIES/CONTEXT response into term lists."""
    entities: list[str] = []
    context: list[str] = []
    for line in raw.splitlines():
        m = re.match(r"\s*(ENTITIES|CONTEXT)\s*:\s*(.+)", line, re.IGNORECASE)
        if not m:
            continue
        label = m.group(1).upper()
        terms = [t.strip().replace("+", "") for t in m.group(2).split(",") if t.strip()]
        if label == "ENTITIES":
            entities = terms
        else:
            context = terms
    return entities, context


def _quote_term(term: str) -> str:
    """Quote multi-word phrases; leave single words bare so NewsAPI can stem."""
    term = term.strip()
    return f'"{term}"' if " " in term else term


def _or_clause(parts: list[str]) -> str:
    """Wrap a list of terms in a single OR clause; parens added when >1 term."""
    if not parts:
        return ""
    if len(parts) == 1:
        return parts[0]
    return "(" + " OR ".join(parts) + ")"


def _split_context_groups(parts: list[str]) -> list[list[str]]:
    """
    Split context terms into 2 groups so results must satisfy multiple themes.
    Gemini is asked to order terms most-specific → least-specific, so we
    interleave (group A: 0,2,4… / group B: 1,3,5…) which puts at least one
    high-specificity term in each AND'd group.
    With <2 terms total we keep a single group (no nested AND).
    """
    if len(parts) < 2:
        return [parts] if parts else []
    return [parts[0::2], parts[1::2]]


def _build_operator_query(entities: list[str], context: list[str]) -> str:
    """
    Build (entity1 OR entity2) AND (ctx_a1 OR ctx_a2) AND (ctx_b1 OR ctx_b2).
    Entities are required; context is split into 2 OR-groups that are AND'd
    so a result must touch multiple themes, not just one stray word.
    Falls back gracefully if either group is empty.
    """
    ent_parts = [_quote_term(e) for e in entities if e.strip()]
    ctx_parts = [_quote_term(c) for c in context if c.strip()]

    clauses: list[str] = []
    if ent_parts:
        clauses.append(_or_clause(ent_parts))
    for group in _split_context_groups(ctx_parts):
        clause = _or_clause(group)
        if clause:
            clauses.append(clause)

    if not clauses:
        return ""
    if len(clauses) == 1:
        return clauses[0]
    return " AND ".join(clauses)


def _fallback_query(title: str) -> str:
    """When Gemini is unavailable: treat capitalized words as entities, others as context."""
    words = [w.strip('.,;:"\'!?()[]') for w in title.split()]
    entities: list[str] = []
    context: list[str] = []
    for w in words:
        if len(w) <= 3 or w.lower() in _STOPWORDS:
            continue
        if w[0].isupper():
            entities.append(w)
        else:
            context.append(w)
    query = _build_operator_query(entities[:3], context[:6])
    return query or title[:80]
