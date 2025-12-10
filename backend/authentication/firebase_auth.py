import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings


if not firebase_admin._apps:
    cred = credentials.Certificate("path/to/firebase-key.json")
    firebase_admin.initialize_app(cred)


def verify_firebase_token(id_token):
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception:
        return None