import json
from django.core.management.base import BaseCommand
from questions.models import Question

class Command(BaseCommand):
    help = "Load ClueBase questions from JSON"

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to ClueBase JSON file')

    def handle(self, *args, **options):
        path = options['json_file']
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        created_count = 0
        for item in data:
            q_text = item.get('question') or item.get('text')
            q_answer = item.get('answer')
            q_difficulty = item.get('difficulty', 'medium').lower()
            q_category = item.get('category', 'General')

            if not q_text or not q_answer:
                continue  # skip invalid entries

            Question.objects.create(
                text=q_text,
                answer=q_answer,
                difficulty=q_difficulty,
                category=q_category
            )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Imported {created_count} questions from {path}"))
