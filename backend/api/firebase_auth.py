from types import SimpleNamespace
from rest_framework import authentication, exceptions

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
except Exception:  # firebase_admin may not be installed/configured in local dev
    firebase_admin = None
    firebase_auth = None

# Initialize Firebase (gracefully handles missing credentials)
from .firebase import initialize_firebase
initialize_firebase()


class FirebaseAuthentication(authentication.BaseAuthentication):
    """DRF authentication class that verifies Firebase ID tokens.

    Notes:
    - Requires `firebase-admin` to be installed and initialized in the running
      environment. Initialization can be done in your project startup with
      `firebase_admin.initialize_app(...)` using credentials.
    - On successful verification returns a lightweight `user` object with
      attributes: `is_authenticated`, `uid`, and `display_name`.
    """

    def authenticate(self, request):
        # If Firebase Admin SDK is not available, return None (can't authenticate)
        if firebase_admin is None or firebase_auth is None:
            return None

        # Check if Firebase is initialized
        if not firebase_admin._apps:
            return None

        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise exceptions.AuthenticationFailed("Invalid Authorization header.")

        id_token = parts[1]
        try:
            # verify_id_token throws on failure
            decoded = firebase_auth.verify_id_token(id_token)
            uid = decoded.get("uid")

            display_name = None
            try:
                user_record = firebase_auth.get_user(uid)
                display_name = getattr(user_record, "display_name", None)
            except Exception:
                # Non-fatal — display name is optional
                display_name = None

            user = SimpleNamespace()
            user.is_authenticated = True
            user.uid = uid
            user.display_name = display_name

            return (user, decoded)

        except Exception as exc:
            raise exceptions.AuthenticationFailed("Invalid Firebase token") from exc
