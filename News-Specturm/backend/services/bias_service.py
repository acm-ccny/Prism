import json
from pathlib import Path
from typing import Optional

MODEL_PATH = Path(__file__).resolve().parent.parent / "data" / "final_bias_model"
SOURCE_BIAS_PATH = Path(__file__).resolve().parent.parent / "data" / "source_bias.json"

# Trained DistilBERT label order: 0=left, 1=center, 2=right.
# Two label formats are normalized here:
#   - "LABEL_0/1/2"  → emitted when config.json has no id2label
#   - "left/center/right" → emitted when id2label IS defined (our case)
# Keeping both keeps us robust to retrains that drop the label names.
LABEL_TO_BIAS: dict[str, str] = {
    "LABEL_0": "left",
    "LABEL_1": "center",
    "LABEL_2": "right",
    "left": "left",
    "center": "center",
    "right": "right",
    # Some retrains use "centre" or capitalized forms — normalize defensively.
    "centre": "center",
    "Left": "left",
    "Center": "center",
    "Right": "right",
}

_pipeline = None
_model_available = False

with SOURCE_BIAS_PATH.open("r", encoding="utf-8") as _f:
    _raw = json.load(_f)
_DOMAIN_LOOKUP: dict[str, dict] = {
    domain: val for domain, val in _raw.items() if not domain.startswith("_")
}


def _load_model() -> None:
    global _pipeline, _model_available

    weights_file = MODEL_PATH / "model.safetensors"
    if not weights_file.exists() or weights_file.stat().st_size < 1_000_000:
        print("bias_service: model weights absent or placeholder — domain-lookup fallback active")
        _model_available = False
        return

    try:
        from transformers import pipeline as hf_pipeline  # type: ignore

        _pipeline = hf_pipeline(
            "text-classification",
            model=str(MODEL_PATH),
            tokenizer=str(MODEL_PATH),
            device=-1,
            top_k=1,
            truncation=True,
            max_length=512,
        )
        _model_available = True
        print("bias_service: DistilBERT model loaded")
    except Exception as exc:
        print(f"bias_service: model load failed ({exc}) — domain-lookup fallback active")
        _model_available = False


_load_model()


def predict_bias_from_text(text: str) -> tuple[Optional[str], Optional[float]]:
    """Run the DistilBERT classifier on free text. Returns (bias, confidence) or (None, None)."""
    if not _model_available or not _pipeline or not text:
        return None, None
    try:
        result = _pipeline(text[:1024])
        top = result[0] if result else None
        if isinstance(top, list):
            top = top[0]
        if top:
            bias = LABEL_TO_BIAS.get(top.get("label", ""))
            score = round(float(top.get("score", 0.0)), 4)
            return bias, score
    except Exception as exc:
        print(f"bias_service: inference error ({exc})")
    return None, None


def predict_bias_from_domain(domain: str) -> tuple[Optional[str], Optional[float]]:
    """Domain-based lookup from source_bias.json."""
    # TEMP: domain JSON path disabled for testing — force model-only path.
    return None, None
    if not domain:
        return None, None
    candidates = [domain]
    parts = domain.split(".")
    if len(parts) > 2:
        candidates.append(".".join(parts[-2:]))
    for candidate in candidates:
        match = _DOMAIN_LOOKUP.get(candidate)
        if match:
            return match.get("bias"), 0.9
    return None, None


def predict_bias(text: Optional[str], domain: Optional[str] = None) -> tuple[Optional[str], Optional[float]]:
    """
    Prefer ML model inference on text; fall back to domain lookup when the
    model is unavailable or text is empty.
    """
    if text and _model_available:
        bias, conf = predict_bias_from_text(text)
        if bias:
            return bias, conf
    if domain:
        return predict_bias_from_domain(domain)
    return None, None
