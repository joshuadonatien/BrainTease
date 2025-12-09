from django.db import models
import uuid


DIFFICULTY_CHOICES = [
    ("easy", "Easy"),
    ("medium", "Medium"),
    ("hard", "Hard"),
]


class UserScore(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100)  # Firebase UID
    score = models.IntegerField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["-score", "created_at", "difficulty"]),
        ]

    @property
    def submitted_at(self):
        return self.created_at

    def to_response(self, user_display_name: str | None = None):
        return {
            "score_id": str(self.id),
            "user_display_name": user_display_name,
            "score": self.score,
            "difficulty": self.difficulty,
            "submitted_at": self.submitted_at.isoformat(),
        }

    def __str__(self):
        return f"{self.user_id} - {self.score}"


class GameSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    categories = models.JSONField()  # list of strings
    score = models.IntegerField()
    correct_count = models.IntegerField(null=True, blank=True)
    total_questions = models.IntegerField(null=True, blank=True)
    time_taken_seconds = models.IntegerField(null=True, blank=True)
    allowed_hints = models.IntegerField(null=True, blank=True)
    hints_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["-score", "created_at", "difficulty"]),
        ]

    @property
    def submitted_at(self):
        return self.created_at

    def set_hint_limits(self):
        if self.total_questions:
            self.allowed_hints = max(1, self.total_questions // 5)

    def to_response(self, user_display_name: str | None = None):
        return {
            "score_id": str(self.id),
            "user_display_name": user_display_name,
            "score": self.score,
            "difficulty": self.difficulty,
            "correct_count": self.correct_count,
            "total_questions": self.total_questions,
            "time_taken_seconds": self.time_taken_seconds,
            "allowed_hints": self.allowed_hints,   
            "hints_used": self.hints_used,
            "submitted_at": self.submitted_at.isoformat(),
            "message": "Score submitted successfully",
        }

    def __str__(self):
        return f"Session {self.id} by {self.user_id}"
