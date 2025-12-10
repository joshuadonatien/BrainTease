# Multiplayer Game API Documentation

## Overview

The multiplayer game system allows players to create sessions, join them, play simultaneously, and automatically compute winners when all players finish.

## Endpoints

### 1. Create Multiplayer Session
**POST** `/api/multiplayer/create`

Creates a new multiplayer session. The creator becomes the first player.

**Authentication**: Required (Firebase JWT)

**Request Body**:
```json
{
  "number_of_players": 4,
  "difficulty": "medium",
  "total_questions": 10,
  "board_seed": "optional-seed-string"
}
```

**Parameters**:
- `number_of_players` (required): Integer between 2-10. Target number of players for the session.
- `difficulty` (optional): "easy", "medium", or "hard". Default: "easy"
- `total_questions` (optional): Integer between 1-50. Default: 10
- `board_seed` (optional): String up to 64 characters. Used to generate same question order for all players. Auto-generated if not provided.

**Response** (201 Created):
```json
{
  "session_id": "uuid-here",
  "board_seed": "seed-string",
  "players": ["player1_uid"],
  "number_of_players": 4,
  "current_players": 1,
  "difficulty": "medium",
  "total_questions": 10,
  "status": "waiting",
  "created_at": "2025-12-10T04:52:00Z"
}
```

---

### 2. Join Multiplayer Session
**POST** `/api/multiplayer/join`

Join an existing multiplayer session. Game automatically starts when all players have joined.

**Authentication**: Required (Firebase JWT)

**Request Body**:
```json
{
  "session_id": "uuid-here"
}
```

**Response** (200 OK):
```json
{
  "session_id": "uuid-here",
  "players": ["player1_uid", "player2_uid"],
  "current_players": 2,
  "number_of_players": 4,
  "status": "waiting",  // or "active" if session is now full
  "board_seed": "seed-string",
  "difficulty": "medium",
  "total_questions": 10,
  "start_time": "2025-12-10T04:55:00Z"  // null if not started yet
}
```

**Error Responses**:
- 404: Session not found
- 400: Session is full or already finished

---

### 3. Submit Multiplayer Score
**POST** `/api/multiplayer/submit`

Submit a player's score for a multiplayer session. Automatically computes winners when all players have submitted.

**Authentication**: Required (Firebase JWT)

**Request Body**:
```json
{
  "session_id": "uuid-here",
  "score": 850,
  "correct_count": 8,
  "time_taken_seconds": 120
}
```

**Parameters**:
- `session_id` (required): UUID of the session
- `score` (required): Integer >= 0. Player's total score
- `correct_count` (optional): Integer >= 0. Number of correct answers
- `time_taken_seconds` (optional): Integer >= 0. Time taken to complete

**Response** (200 OK):
```json
{
  "session_id": "uuid-here",
  "status": "active",  // or "finished" if all players submitted
  "scores": {
    "player1_uid": {
      "score": 850,
      "correct_count": 8,
      "time_taken_seconds": 120
    },
    "player2_uid": null  // player hasn't submitted yet
  },
  "players_submitted": 1,
  "total_players": 4,
  "winners": ["player1_uid"],  // only present when status is "finished"
  "finished_at": "2025-12-10T05:00:00Z"  // only present when finished
}
```

**Error Responses**:
- 404: Session not found
- 403: User is not a player in this session
- 400: Session hasn't started yet or already finished

---

### 4. Get Multiplayer Session Status
**GET** `/api/multiplayer/<session_id>`

Get the current status of a multiplayer session, including all player scores and winners (if finished).

**Authentication**: Required (Firebase JWT)

**Response** (200 OK):
```json
{
  "session_id": "uuid-here",
  "board_seed": "seed-string",
  "status": "finished",
  "difficulty": "medium",
  "total_questions": 10,
  "number_of_players": 4,
  "current_players": 4,
  "players": ["player1_uid", "player2_uid", "player3_uid", "player4_uid"],
  "player_scores": {
    "player1_uid": {
      "display_name": "Player 1",
      "score": 850,
      "correct_count": 8,
      "time_taken_seconds": 120,
      "submitted": true
    },
    "player2_uid": {
      "display_name": "Player 2",
      "score": 920,
      "correct_count": 9,
      "time_taken_seconds": 105,
      "submitted": true
    }
    // ... other players
  },
  "players_submitted": 4,
  "created_at": "2025-12-10T04:52:00Z",
  "start_time": "2025-12-10T04:55:00Z",
  "finished_at": "2025-12-10T05:10:00Z",
  "winners": ["player2_uid"],  // highest score wins
  "winner_details": [
    {
      "user_id": "player2_uid",
      "display_name": "Player 2",
      "score": 920
    }
  ]
}
```

**Status Values**:
- `waiting`: Session created but not all players have joined
- `active`: All players joined, game in progress
- `finished`: All players submitted scores, winners computed

---

## Game Flow

1. **Player A creates session**:
   ```bash
   POST /api/multiplayer/create
   {
     "number_of_players": 4,
     "difficulty": "medium",
     "total_questions": 10
   }
   ```
   - Returns `session_id` and `board_seed`

2. **Players B, C, D join**:
   ```bash
   POST /api/multiplayer/join
   {
     "session_id": "uuid-from-step-1"
   }
   ```
   - When 4th player joins, status automatically changes to `"active"` and `start_time` is set

3. **All players play on their devices**:
   - Use `board_seed` to generate same question order
   - Use `start-game` endpoint with the `board_seed` for consistent questions
   - Each player submits their score when done

4. **Submit scores**:
   ```bash
   POST /api/multiplayer/submit
   {
     "session_id": "uuid",
     "score": 850,
     "correct_count": 8,
     "time_taken_seconds": 120
   }
   ```
   - When last player submits, status changes to `"finished"`
   - Winners are automatically computed (highest score wins)
   - Ties are allowed - multiple winners possible

5. **Check results**:
   ```bash
   GET /api/multiplayer/<session_id>
   ```
   - Returns full session details including winners

---

## Winner Computation

- Winners are computed automatically when all players submit
- Highest score wins
- Multiple winners are allowed (ties)
- Winners are stored in `winners` field as a list of user IDs

---

## Error Handling

All endpoints include comprehensive error handling:
- Authentication errors (401)
- Validation errors (400)
- Not found errors (404)
- Permission errors (403)
- Server errors (500)

All errors are logged for debugging while returning user-friendly messages.

---

## Database Model

The `MultiplayerSession` model stores:
- `session_id`: Unique identifier
- `board_seed`: Seed for question generation
- `players`: List of Firebase user IDs
- `number_of_players`: Target number of players
- `scores`: Dictionary mapping user_id to score data
- `status`: waiting/active/finished
- `start_time`: When game started (all players joined)
- `finished_at`: When all players finished
- `winners`: List of winner user IDs
- `difficulty`: Game difficulty
- `total_questions`: Number of questions
- `created_at`: Session creation time

---

## Integration with Single Player Game

The multiplayer system uses the same question generation system (`start-game` endpoint) but ensures all players get the same questions by using the `board_seed`. The `board_seed` can be passed to the question generation logic to ensure consistent question ordering across all players.

