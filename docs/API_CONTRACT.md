# BrainTease API Contract v1.0

**Document Version**: 1.0  
**Last Updated**: December 5, 2024  
**Author**: Lauren Oliver - Backend Lead  

## Document Overview

This document defines the REST API contract between the BrainTease backend and frontend.

### Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.braintease.com` (TBD)

### Authentication
All endpoints (except public leaderboard) require Firebase JWT authentication:
```http
Authorization: Bearer 
```

### Content Type
All requests and responses use JSON:
```http
Content-Type: application/json
```


### Endpoint 1 - Get Questions
GET /api/questions/

**Description:**  
Returns a randomized list of trivia questions based on difficulty and (optional) selected categories.

**Method:** GET  

**Query Parameters:**  
- `difficulty` (required): "easy" | "medium" | "hard"  - difficulty level of questions
- `categories` (optional): comma-separated list, e.g. "history,science" - catgegory of question to be answered

**Example Request:**  
/api/questions/?difficulty=easy&categories=history,science

**Success Response (200):**
{
  "questions": [
    {
      "id": "q234",
      "category": "History",
      "question": "Who was the first US president?",
      "value": 200,
      "hint": "Famously on the $1 bill"
    }
  ]
}

**Error Responses:**  
- 400 — Missing required parameter (`difficulty`)  
- 500 — Unable to fetch questions




### Endpoint 2 - Submit Score
POST /api/submit-score/

**Description:**  
Submit a user's game score. The user is identified via the Firebase JWT — no `user_id` field is required in the body.

**Method:** POST  

**Authentication:** Required — Firebase JWT in `Authorization: Bearer <token>` header.

**Request Body (application/json):**
- `score` (required): integer — total points earned this session.
- `difficulty` (required): "easy" | "medium" | "hard" — the difficulty played.
- `correct_count` (optional): integer — number of correctly answered questions.
- `total_questions` (optional): integer — total questions in the session.
- `time_taken_seconds` (optional): integer — elapsed time for the session in seconds.

**Example Request Body:**
{
  "score": 420,
  "difficulty": "medium",
  "correct_count": 7,
  "total_questions": 10,
  "time_taken_seconds": 95
}

**Success Response (201 Created):**
{
  "score_id": "s789",
  "user_display_name": "lauren",
  "score": 420,
  "difficulty": "medium",
  "correct_count": 7,
  "total_questions": 10,
  "time_taken_seconds": 95,
  "submitted_at": "2025-12-07T14:23:00Z",
  "message": "Score submitted successfully"
}

**Alternate Success (200):** If the endpoint performs upserts or returns an aggregated result (e.g., new rank), it may return 200 with additional fields such as `new_rank` or `leaderboard_snapshot`.

**Error Responses:**
- 400 — `{"error":"Invalid payload"}` — missing/invalid `score` or `difficulty`.
- 401 — `{"error":"Authentication credentials were not provided or are invalid"}` — missing/expired token.
- 500 — `{"error":"Internal server error"}` — unexpected failure while recording score.



### Endpoint 3 - Get Leaderboard
GET /api/leaderboard/

**Description:**  
Returns the leaderboard sorted by score in descending order. If a tie occurs, then it's sorted by the submitted at time in ascendning order. This endpoint is public (no authentication required) unless the server is configured to require auth for full profile details.

**Method:** GET

**Query Parameters:**
- `limit` (optional): integer — max number of entries to return (default: 10, max: 100).
- `difficulty` (optional): "easy" | "medium" | "hard" — filter leaderboard by difficulty.
- `timeframe` (optional): "all_time" | "weekly" | "daily" — aggregation window (default: "all_time").
- `page` (optional): integer — page number for pagination (default: 1).

**Example Request:**
/api/leaderboard/?limit=10&difficulty=medium&timeframe=weekly

**Success Response (200):**
{
  "leaderboard": [
    {
      "rank": 1,
      "user_display_name": "alex",
      "score": 980,
      "difficulty": "medium",
      "submitted_at": "2025-12-07T12:00:00Z"
    },
    {
      "rank": 2,
      "user_display_name": "jamie",
      "score": 860,
      "difficulty": "medium",
      "submitted_at": "2025-12-06T18:42:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total_entries": 234
}

**Error Responses:**
- 400 — `{"error":"Invalid query parameter"}` — e.g., non-numeric `limit` or unsupported `timeframe`.
- 500 — `{"error":"Internal server error"}` — database/aggregation failure.



### API Conventions


