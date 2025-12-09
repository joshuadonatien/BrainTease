# backend/api/firebase.py
import os
import json
from pathlib import Path

try:
    import firebase_admin
    from firebase_admin import credentials
except ImportError:
    firebase_admin = None
    credentials = None

def initialize_firebase():
    """Initialize Firebase Admin for Django backend (safe to call multiple times).
    
    Returns the Firebase app if successful, None if Firebase is not available or
    credentials are not found. This allows the app to start even without Firebase.
    """
    if firebase_admin is None or credentials is None:
        return None

    if firebase_admin._apps:
        # Already initialized — skip
        return firebase_admin.get_app()

    # Option A: Environment variable containing raw JSON (recommended for deployment)
    raw_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if raw_json:
        try:
            cred = credentials.Certificate(json.loads(raw_json))
            return firebase_admin.initialize_app(cred)
        except Exception as e:
            # Log error but don't crash - allow app to start without Firebase
            print(f"Warning: Failed to initialize Firebase from FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
            return None

    # Option B: Path to key file (check multiple locations)
    key_path = os.getenv("SERVICE_ACCOUNT_KEY_PATH")
    if not key_path:
        # Try common locations relative to backend directory
        backend_dir = Path(__file__).resolve().parent.parent
        possible_paths = [
            backend_dir / "serviceAccountKey.json",
            Path("serviceAccountKey.json"),
        ]
        for path in possible_paths:
            if path.exists():
                key_path = str(path)
                break
    
    if key_path and os.path.exists(key_path):
        try:
            cred = credentials.Certificate(key_path)
            return firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Warning: Failed to initialize Firebase from {key_path}: {e}")
            return None

    # Don't raise error - just return None to allow app to start
    print("Warning: Firebase Admin could NOT initialize. "
          "Set FIREBASE_SERVICE_ACCOUNT_JSON or SERVICE_ACCOUNT_KEY_PATH.")
    return None

# Initialize immediately (but gracefully handle failures)
initialize_firebase()
