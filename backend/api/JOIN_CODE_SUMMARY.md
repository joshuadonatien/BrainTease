# Join Code Support - Multiplayer API

## Overview

The backend now fully supports the frontend's multiplayer lobby flow with **short join codes** instead of long UUIDs. This makes it easy for players to share room codes.

## What Changed

### 1. Added `join_code` Field
- 6-character alphanumeric codes (e.g., "ABC123", "XYZ789")
- Automatically generated when creating a session
- Excludes confusing characters (0, O, I, 1) for easier sharing
- Unique and indexed for fast lookups

### 2. Updated Endpoints

#### Create Session (`POST /api/multiplayer/create`)
**Response now includes `join_code`:**
```json
{
  "session_id": "uuid-here",
  "join_code": "ABC123",  // ← NEW: Short code to share
  "board_seed": "...",
  ...
}
```

#### Join Session (`POST /api/multiplayer/join`)
**Now accepts `join_code` instead of `session_id`:**
```json
// Request
{
  "join_code": "ABC123"  // ← Changed from session_id
}

// Response
{
  "session_id": "uuid-here",
  "join_code": "ABC123",
  ...
}
```

#### Get Session Status
**Supports both methods:**

1. **By UUID** (for internal use):
   ```
   GET /api/multiplayer/<uuid:session_id>
   ```

2. **By Join Code** (for frontend):
   ```
   GET /api/multiplayer/by-code/?join_code=ABC123
   ```

## Frontend Integration Flow

### Creating a Room:
```javascript
// 1. User clicks "Create Room" in lobby
const response = await fetch('/api/multiplayer/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number_of_players: 4,
    difficulty: 'medium',
    total_questions: 10
  })
});

const { join_code } = await response.json();
// Display join_code to user: "Share code: ABC123"
```

### Joining a Room:
```javascript
// 2. User enters join code in lobby
const joinCode = "ABC123"; // From user input

const response = await fetch('/api/multiplayer/join', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    join_code: joinCode
  })
});

const session = await response.json();
// User successfully joined!
```

### Checking Session Status:
```javascript
// 3. Check if session is ready to start
const response = await fetch(`/api/multiplayer/by-code/?join_code=${joinCode}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const session = await response.json();
if (session.status === 'active') {
  // All players joined, game can start!
}
```

## Code Format

- **Length**: 6 characters
- **Characters**: Uppercase letters and digits
- **Excluded**: 0, O, I, 1 (to avoid confusion)
- **Examples**: `ABC123`, `XYZ789`, `DEF456`
- **Case**: Stored as uppercase, automatically normalized on input

## Error Handling

All endpoints return user-friendly error messages:

- `404`: "Invalid join code. Session not found."
- `400`: "Session is full" or "Session already finished"
- `401`: "User authentication failed"

## Database

The `join_code` field is:
- **Unique**: No two sessions can have the same code
- **Indexed**: Fast lookups by code
- **Auto-generated**: Created automatically when session is created
- **Immutable**: Once set, doesn't change

## Summary

✅ **Backend fully supports frontend lobby flow:**
- ✅ Create room → get short join code
- ✅ Join room → use join code (not UUID)
- ✅ Check session status → use join code
- ✅ Easy to share codes between players
- ✅ Error handling for invalid/full sessions

The backend is ready for the frontend lobby implementation!

