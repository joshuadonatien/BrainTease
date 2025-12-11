"""
BrainTease Test Suite
Tests the backend API functionality including authentication, gameplay, questions, hints, and leaderboard.
"""
from django.test import TestCase, Client
from unittest.mock import patch
from django.urls import reverse
import json

# Example constants
FAKE_FIREBASE_UID = "12345"
FAKE_USER_EMAIL = "testuser@example.com"


class FirebaseAuthMock:
    """ Mock class to replace Firebase verification """
    @staticmethod
    def verify_id_token(token):
        return {"uid": FAKE_FIREBASE_UID, "email": FAKE_USER_EMAIL}


class AuthTests(TestCase):
    """ Tests for user authentication (FR-1, FR-2, FR-3) """

    def setUp(self):
        self.client = Client()

    @patch("api.firebase_auth.auth.verify_id_token", FirebaseAuthMock.verify_id_token)
    def test_google_login(self):
        response = self.client.post(
            reverse("api:login"),
            data=json.dumps({"token": "fake_token"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("uid", data)
        self.assertEqual(data["uid"], FAKE_FIREBASE_UID)


class GameplayTests(TestCase):
    """ Tests for gameplay functionality (FR-4 to FR-10) """

    def setUp(self):
        self.client = Client()
        # Login first
        self.client.post(
            reverse("api:login"),
            data=json.dumps({"token": "fake_token"}),
            content_type="application/json"
        )

    def test_select_difficulty(self):
        response = self.client.post(reverse("api:start_game"), {"difficulty": "Easy"})
        self.assertIn(response.status_code, [200, 201])
        data = response.json()
        self.assertIn("questions", data)
        self.assertIsInstance(data["questions"], list)

    def test_answer_question(self):
        game_resp = self.client.post(reverse("api:start_game"), {"difficulty": "Easy"})
        questions = game_resp.json()["questions"]
        question_id = questions[0]["id"]

        response = self.client.post(
            reverse("api:answer_question"),
            {"question_id": question_id, "answer": "A"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("correct", response.json())


class QuestionHandlingTests(TestCase):
    """ Tests for question fetching and mapping (FR-17 to FR-20) """

    def setUp(self):
        self.client = Client()

    @patch("api.views.fetch_trivia_questions")
    def test_fetch_questions_success(self, mock_fetch):
        mock_fetch.return_value = [
            {"id": 1, "question": "Capital of France?", "correct_answer": "Paris", "category": "Geography"}
        ]
        response = self.client.get(reverse("api:get_questions"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["correct_answer"], "Paris")

    @patch("api.views.fetch_trivia_questions")
    def test_fallback_questions_on_api_fail(self, mock_fetch):
        mock_fetch.side_effect = Exception("API down")
        response = self.client.get(reverse("api:get_questions"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data) > 0)


class HintTests(TestCase):
    """ Tests for hints & clues (FR-21, FR-22) """

    def setUp(self):
        self.client = Client()
        # Login and start game
        self.client.post(
            reverse("api:login"),
            data=json.dumps({"token": "fake_token"}),
            content_type="application/json"
        )
        game_resp = self.client.post(reverse("api:start_game"), {"difficulty": "Easy"})
        self.session_id = game_resp.json()["session_id"]

    def test_request_hint_limit(self):
        for i in range(3):
            response = self.client.get(reverse("api:get_hint", args=[self.session_id]), {"question_id": 1})
            self.assertEqual(response.status_code, 200)
            self.assertIn("hint", response.json())

        response = self.client.get(reverse("api:get_hint", args=[self.session_id]), {"question_id": 1})
        self.assertEqual(response.status_code, 400)  # Exceeded hint limit


class LeaderboardTests(TestCase):
    """ Tests for leaderboard functionality (FR-24, FR-26, FR-27) """

    def setUp(self):
        self.client = Client()
        # Login first
        self.client.post(
            reverse("api:login"),
            data=json.dumps({"token": "fake_token"}),
            content_type="application/json"
        )

    def test_store_score(self):
        response = self.client.post(reverse("api:submit_score"), {"uid": FAKE_FIREBASE_UID, "score": 100})
        self.assertIn(response.status_code, [200, 201])
        self.assertIn("success", response.json())

    def test_global_leaderboard(self):
        response = self.client.get(reverse("api:leaderboard"))
        self.assertEqual(response.status_code, 200)
        data = response.json()["leaderboard"]  # Extract list
        self.assertIsInstance(data, list)


class SystemTests(TestCase):
    """ End-to-end / integration tests """

    def setUp(self):
        self.client = Client()

    @patch("api.firebase_auth.auth.verify_id_token", FirebaseAuthMock.verify_id_token)
    @patch("api.views.fetch_trivia_questions")
    def test_full_game_flow(self, mock_fetch):
        mock_fetch.return_value = [
            {"id": 1, "question": "1+1=?", "correct_answer": "2", "category": "Math"}
        ]

        # Login
        login_response = self.client.post(
            reverse("api:login"),
            json.dumps({"token": "fake_token"}),
            content_type="application/json"
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.json()["uid"], FAKE_FIREBASE_UID)

        # Start game
        game_response = self.client.post(reverse("api:start_game"), {"difficulty": "Easy"})
        self.assertEqual(game_response.status_code, 200)
        session_id = game_response.json()["session_id"]
        question_id = game_response.json()["questions"][0]["id"]

        # Answer question
        answer_response = self.client.post(
            reverse("api:answer_question"),
            {"question_id": question_id, "answer": "2"}
        )
        self.assertEqual(answer_response.status_code, 200)
        self.assertTrue(answer_response.json()["correct"])

        # Request hint (optional)
        hint_response = self.client.get(reverse("api:get_hint", args=[session_id]), {"question_id": question_id})
        self.assertEqual(hint_response.status_code, 200)

        # Submit score
        score_response = self.client.post(reverse("api:submit_score"), {"uid": FAKE_FIREBASE_UID, "score": 50})
        self.assertIn(score_response.status_code, [200, 201])

        # Check leaderboard
        leaderboard_response = self.client.get(reverse("api:leaderboard"))
        self.assertEqual(leaderboard_response.status_code, 200)
        leaderboard_data = leaderboard_response.json()["leaderboard"]
        self.assertIsInstance(leaderboard_data, list)
