# questions/services/opentdb.py
import logging
import requests
import html
from django.conf import settings
from django.core.cache import cache
from urllib.parse import urljoin

logger = logging.getLogger(__name__)

OPEN_TDB_BASE = getattr(settings, "OPEN_TDB_BASE_URL", "https://opentdb.com")
DEFAULT_AMOUNT = getattr(settings, "OPEN_TDB_DEFAULT_AMOUNT", 10)

def _build_url(path="/api.php"):
    return urljoin(OPEN_TDB_BASE, path)

def _decode_item(raw):
    """Decode HTML entities returned by OpenTDB and normalize keys."""
    try:
        return {
            "question": html.unescape(raw.get("question", "")),
            "correct_answer": html.unescape(raw.get("correct_answer", "")),
            "incorrect_answers": [html.unescape(x) for x in raw.get("incorrect_answers", [])],
            "type": raw.get("type"),  # "multiple" or "boolean"
            "difficulty": raw.get("difficulty"),
            "category": raw.get("category")
        }
    except Exception as e:
        logger.warning(f"Error decoding item: {str(e)}")
        # Return minimal safe structure
        return {
            "question": "",
            "correct_answer": "",
            "incorrect_answers": [],
            "type": raw.get("type", "multiple"),
            "difficulty": raw.get("difficulty", ""),
            "category": raw.get("category", "")
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
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        # Response code 0 = success per OpenTDB
        response_code = data.get("response_code", -1)
        if response_code != 0:
            error_messages = {
                1: "No results found",
                2: "Invalid parameter",
                3: "Token not found",
                4: "Token empty"
            }
            error_msg = error_messages.get(response_code, f"Unknown error code: {response_code}")
            logger.warning(f"OpenTDB API returned error code {response_code}: {error_msg}")
            return []
        
        results = data.get("results", [])
        if not results:
            logger.warning(f"OpenTDB returned empty results for params: {params}")
            return []
        
        items = []
        for i, raw_item in enumerate(results):
            try:
                decoded = _decode_item(raw_item)
                # Filter out invalid items
                if decoded.get("question") and decoded.get("correct_answer"):
                    items.append(decoded)
                else:
                    logger.warning(f"Skipping invalid question at index {i}")
            except Exception as decode_error:
                logger.warning(f"Error decoding question at index {i}: {str(decode_error)}")
                continue
        
        # Only cache if we got valid items
        if items and use_cache:
            try:
                cache.set(cache_key, items, 60 * 5)  # cache 5 minutes
            except Exception as cache_error:
                logger.warning(f"Failed to cache results: {str(cache_error)}")
        
        return items
        
    except requests.exceptions.Timeout:
        logger.error(f"OpenTDB API timeout for params: {params}")
        return []
    except requests.exceptions.ConnectionError:
        logger.error(f"OpenTDB API connection error for params: {params}")
        return []
    except requests.exceptions.HTTPError as e:
        logger.error(f"OpenTDB API HTTP error {e.response.status_code}: {str(e)}")
        return []
    except ValueError as e:
        logger.error(f"Invalid JSON response from OpenTDB: {str(e)}")
        return []
    except requests.RequestException as e:
        logger.error(f"OpenTDB API request exception: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in fetch_questions: {str(e)}", exc_info=True)
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
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        cats = data.get("trivia_categories", [])
        
        if not cats:
            logger.warning("OpenTDB returned empty categories list")
            return []
        
        # Validate category structure
        valid_cats = []
        for cat in cats:
            if isinstance(cat, dict) and "id" in cat and "name" in cat:
                valid_cats.append(cat)
            else:
                logger.warning(f"Invalid category structure: {cat}")
        
        # Only cache if we got valid categories
        if valid_cats and use_cache:
            try:
                cache.set(cache_key, valid_cats, 60 * 60)  # 1 hour
            except Exception as cache_error:
                logger.warning(f"Failed to cache categories: {str(cache_error)}")
        
        return valid_cats
        
    except requests.exceptions.Timeout:
        logger.error("OpenTDB categories API timeout")
        return []
    except requests.exceptions.ConnectionError:
        logger.error("OpenTDB categories API connection error")
        return []
    except requests.exceptions.HTTPError as e:
        logger.error(f"OpenTDB categories API HTTP error {e.response.status_code}: {str(e)}")
        return []
    except ValueError as e:
        logger.error(f"Invalid JSON response from OpenTDB categories: {str(e)}")
        return []
    except requests.RequestException as e:
        logger.error(f"OpenTDB categories API request exception: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in fetch_categories: {str(e)}", exc_info=True)
        return []
