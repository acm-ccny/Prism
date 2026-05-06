import os
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
    Ask Gemini to return a comma-separated keyword list from the headline,
    then transform it into a NewsAPI operator query: "w1"OR"w2"AND"w3"...
    Falls back to stopword-filtered title keywords if Gemini is unavailable.
    """
    if not GEMINI_API_KEY:
        return _fallback_query(title)

    prompt = (
        "Read the news headline below and return a comma-separated list of "
        "5 to 8 keywords or short phrases that best identify the specific "
        "story, people, places, and topic. "
        "Return only the list in this exact format with no explanation:\n"
        "word1,word2,word3\n\n"
        f"Headline: {title}\n\nKeywords:"
    )

    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.post(
                GEMINI_URL,
                params={"key": GEMINI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.1, "maxOutputTokens": 60},
                },
            )
            resp.raise_for_status()
            data = resp.json()

        raw = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        print(f"[gemini] raw output: {raw}")
        keywords = [k.strip().replace("+", "") for k in raw.split(",") if k.strip()]
        if keywords:
            query = _build_operator_query(keywords)
            print(f"[gemini] operator query sent to API: {query}")
            return query
        return _fallback_query(title)
    except Exception as exc:
        print(f"gemini_service: keyword extraction failed ({exc}) — using fallback")
        return _fallback_query(title)


def _build_operator_query(keywords: list[str]) -> str:
    """
    Transform ["w1", "w2", "w3"] → "w1"OR"w2"AND"w3"
    All separators are OR except the last which is AND.
    """
    quoted = [f'"{k}"' for k in keywords]
    if len(quoted) == 1:
        return quoted[0]
    return "OR".join(quoted[:-1]) + "AND" + quoted[-1]


def _fallback_query(title: str) -> str:
    words = [w.strip('.,;:"\'!?()[]') for w in title.split()]
    keywords = [w for w in words if len(w) > 3 and w.lower() not in _STOPWORDS]
    return _build_operator_query(keywords[:7]) if keywords else title[:80]
