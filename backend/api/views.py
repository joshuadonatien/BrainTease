from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def question_list(request):
    data = [
        {
            "id": 1,
            "question": "What is the capital of France?",
            "options": ["Rome", "Paris", "Berlin", "Madrid"],
            "answer": 1
        },
        {
            "id": 2,
            "question": "What is 2 + 2?",
            "options": ["3", "4", "5", "6"],
            "answer": 1
        }
    ]
    return JsonResponse(data, safe=False)


@csrf_exempt
def score_submit(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            score = body.get("score")

            print("✅ Score received:", score)

            return JsonResponse({"status": "success", "score": score})
        except:
            return JsonResponse({"status": "error"}, status=400)

    return JsonResponse({"status": "invalid request"}, status=405)
