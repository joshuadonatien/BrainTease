from django.db import models
import uuid
import random
import string

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



STATUS_CHOICES = [
    ("waiting", "Waiting"),
    ("active", "Active"),
    ("finished", "Finished"),
]

class MultiplayerSession(models.Model):
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    join_code = models.CharField(max_length=8, unique=True, db_index=True)  # Short code for joining (e.g., "ABC123")
    board_seed = models.CharField(max_length=64)  # Used to generate same question order for all players
    players = models.JSONField(default=list)  # list of Firebase user IDs (JSONField works with SQLite)
    number_of_players = models.IntegerField(default=2)  # Target number of players
    scores = models.JSONField(default=dict)  # {user_id: {"score": int, "correct_count": int, "time_taken_seconds": int}}
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="waiting")
    start_time = models.DateTimeField(null=True, blank=True)  # When game actually started (all players joined)
    finished_at = models.DateTimeField(null=True, blank=True)  # When all players finished
    winners = models.JSONField(default=list)  # List of user IDs who won (can be multiple for ties)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="easy")
    total_questions = models.IntegerField(default=10)  # Number of questions in the game
    created_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def generate_join_code():
        """Generate a unique 6-character alphanumeric join code"""
        characters = string.ascii_uppercase + string.digits
        # Exclude confusing characters: 0, O, I, 1
        characters = characters.replace('0', '').replace('O', '').replace('I', '').replace('1', '')
        
        while True:
            code = ''.join(random.choices(characters, k=6))
            if not MultiplayerSession.objects.filter(join_code=code).exists():
                return code

    class Meta:
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["join_code"]),
        ]

    def is_full(self):
        """Check if session has reached maximum number of players"""
        return len(self.players) >= self.number_of_players

    def all_players_submitted(self):
        """Check if all players have submitted their scores"""
        if not self.players:
            return False
        submitted_user_ids = set(self.scores.keys())
        required_user_ids = set(self.players)
        return submitted_user_ids == required_user_ids

    def compute_winners(self):
        """Compute winners based on scores (highest score wins, ties are allowed)"""
        if not self.scores or not self.all_players_submitted():
            return []
        
        # Get all scores
        score_list = []
        for user_id, score_data in self.scores.items():
            score_value = score_data.get("score", 0) if isinstance(score_data, dict) else score_data
            score_list.append((user_id, score_value))
        
        if not score_list:
            return []
        
        # Find maximum score
        max_score = max(score for _, score in score_list)
        
        # Find all players with max score (winners)
        winners = [user_id for user_id, score in score_list if score == max_score]
        return winners

    def __str__(self):
        return f"MultiplayerSession {self.session_id} - {self.status} ({len(self.players)}/{self.number_of_players})"
