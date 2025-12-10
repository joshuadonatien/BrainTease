from django.db import models
<<<<<<< HEAD
from django.contrib.auth.models import User


class Puzzle(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)


def __str__(self):
    return self.title


class UserScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    puzzle = models.ForeignKey(Puzzle, on_delete=models.CASCADE)
    score = models.IntegerField()
    completed_at = models.DateTimeField(auto_now_add=True)
=======
import uuid


DIFFICULTY_CHOICES = [
    ("easy", "Easy"),
    ("medium", "Medium"),
    ("hard", "Hard"),
]


class UserScore(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100)  # Firebase UID
    display_name = models.CharField(max_length=255, blank=True, null=True, help_text="User's display name for leaderboard")
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

    def to_response(self, user_display_name: str | None = None, include_message: bool = False):
        """
        Convert UserScore to API response format.
        
        Optimization: Use stored display_name if available, otherwise use provided parameter.
        include_message parameter is accepted for compatibility but UserScore doesn't include messages.
        """
        # Use stored display_name if available, otherwise fall back to provided parameter
        display_name = self.display_name or user_display_name
        response = {
            "score_id": str(self.id),
            "user_display_name": display_name,
            "score": self.score,
            "difficulty": self.difficulty,
            "submitted_at": self.submitted_at.isoformat(),
        }
        # UserScore doesn't include message field (only GameSession does)
        if include_message:
            response["message"] = "Score submitted successfully"
        return response

    def __str__(self):
        return f"{self.user_id} - {self.score}"


class GameSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100)
    display_name = models.CharField(max_length=255, blank=True, null=True, help_text="User's display name for leaderboard")
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

    def to_response(self, user_display_name: str | None = None, include_message: bool = True):
        """
        Convert GameSession to API response format.
        
        Optimization: Optional message field to reduce response size when not needed.
        Uses stored display_name if available, otherwise uses provided parameter.
        """
        # Use stored display_name if available, otherwise fall back to provided parameter
        display_name = self.display_name or user_display_name
        response = {
            "score_id": str(self.id),
            "user_display_name": display_name,
            "score": self.score,
            "difficulty": self.difficulty,
            "correct_count": self.correct_count,
            "total_questions": self.total_questions,
            "time_taken_seconds": self.time_taken_seconds,
            "allowed_hints": self.allowed_hints,   
            "hints_used": self.hints_used,
            "submitted_at": self.submitted_at.isoformat(),
        }
        # Optimization: Only include message for score submission, not leaderboard
        if include_message:
            response["message"] = "Score submitted successfully"
        return response

    def __str__(self):
        return f"Session {self.id} by {self.user_id}"
>>>>>>> 522b9f8d42b32539e6fa5840eb824218ee72f164
