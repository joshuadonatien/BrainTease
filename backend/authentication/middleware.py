from django.http import JsonResponse
from .firebase_auth import verify_firebase_token


class FirebaseAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response


    def __call__(self, request):
        token = request.headers.get("Authorization")
        if token:
            token = token.replace("Bearer ", "")
            decoded = verify_firebase_token(token)
            if not decoded:
                return JsonResponse({"error": "Invalid Firebase token"}, status=401)
            request.firebase_user = decoded
        return self.get_response(request)