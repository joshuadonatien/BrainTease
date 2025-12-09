import requests
from django.core.management.base import BaseCommand
from questions.models import Question

class Command(BaseCommand):
    help = "Fetches questions from the ClueBase API and stores them in Django DB"

    def handle(self, *args, **kwargs):
        url = "https://cluebase.lukelav.in/api/clues/"
        page = 1
        total = 0

        Question.objects.all().delete()

        while True:
            response = requests.get(url, params={"page": page})
            data = response.json()
            results = data.get("results", [])

            if not results:
                break

            for clue in results:
                Question.objects.create(
                    question=clue["question"],
                    answer=clue["answer"],
                    difficulty=clue.get("difficulty", "medium"),
                    category=clue.get("category", "General")
                )
                total += 1

            page += 1

        self.stdout.write(self.style.SUCCESS(f"Imported {total} questions!"))
