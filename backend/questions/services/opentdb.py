# questions/services/opentdb.py
import requests
import html
from django.conf import settings
from django.core.cache import cache
from urllib.parse import urljoin

OPEN_TDB_BASE = getattr(settings, "OPEN_TDB_BASE_URL", "https://opentdb.com")
DEFAULT_AMOUNT = getattr(settings, "OPEN_TDB_DEFAULT_AMOUNT", 10)

def _build_url(path="/api.php"):
    return urljoin(OPEN_TDB_BASE, path)

def _decode_item(raw):
    """Decode HTML entities returned by OpenTDB and normalize keys."""
    return {
        "question": html.unescape(raw.get("question", "")),
        "correct_answer": html.unescape(raw.get("correct_answer", "")),
        "incorrect_answers": [html.unescape(x) for x in raw.get("incorrect_answers", [])],
        "type": raw.get("type"),  # "multiple" or "boolean"
        "difficulty": raw.get("difficulty"),
        "category": raw.get("category")
    }

def fetch_questions(amount=None, difficulty=None, category=None, qtype="multiple", use_cache=True):
    """
    Fetch questions from OpenTDB.
    Params:
      - amount: int (how many questions)
      - difficulty: "easy"|"medium"|"hard"|None
      - category: OpenTDB category id or None (see notes below)
      - qtype: "multiple" or "boolean"
    Returns: list of normalized question dicts
    """
    if amount is None:
        amount = DEFAULT_AMOUNT

    # cache key for short caching
    cache_key = f"opentdb:{amount}:{difficulty}:{category}:{qtype}"
    if use_cache:
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

    params = {"amount": amount, "type": qtype}
    if difficulty:
        params["difficulty"] = difficulty
    if category:
        params["category"] = category  # OpenTDB expects category id (int) for this param

    url = _build_url("/api.php")
    try:
        resp = requests.get(url, params=params, timeout=6)
        resp.raise_for_status()
        data = resp.json()
        # Response code 0 = success per OpenTDB
        if data.get("response_code") != 0:
            return []
        items = [_decode_item(i) for i in data.get("results", [])]
        cache.set(cache_key, items, 60 * 5)  # cache 5 minutes
        return items
    except requests.RequestException:
        # graceful fallback: empty list (frontend can display message)
        return []

def fetch_categories(use_cache=True):
    """
    Fetch OpenTDB categories.
    returns list of {"id": int, "name": str}
    """
    cache_key = "opentdb:categories"
    if use_cache:
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

    url = _build_url("/api_category.php")
    try:
        resp = requests.get(url, timeout=6)
        resp.raise_for_status()
        data = resp.json()
        cats = data.get("trivia_categories", [])
        cache.set(cache_key, cats, 60 * 60)  # 1 hour
        return cats
    except requests.RequestException:
        return []
