import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createMultiplayerSession, joinMultiplayerSession } from "../services/multiplayerService";
import "../pages/Lobby.css";

export default function Lobby() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [view, setView] = useState("menu"); // "menu", "create", "join"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  
  // Create room form state
  const [numberOfPlayers, setNumberOfPlayers] = useState(4);
  const [difficulty, setDifficulty] = useState("easy");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [createdJoinCode, setCreatedJoinCode] = useState("");
  const [createdSession, setCreatedSession] = useState(null);

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: 100, textAlign: "center" }}>
        <p>Please sign in to access multiplayer games.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  async function handleCreateRoom() {
    setLoading(true);
    setError("");
    
    try {
      const session = await createMultiplayerSession({
        number_of_players: numberOfPlayers,
        difficulty,
        total_questions: totalQuestions,
      });
      
      setCreatedJoinCode(session.join_code);
      setCreatedSession(session);
      setView("created");
      // Store session data in sessionStorage
      sessionStorage.setItem('createdSession', JSON.stringify(session));
      sessionStorage.setItem('createdJoinCode', session.join_code);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to create room");
      setLoading(false);
    }
  }

  async function handleJoinRoom() {
    if (!joinCode || joinCode.length < 6) {
      setError("Please enter a valid join code (6 characters)");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const session = await joinMultiplayerSession(joinCode);
      
      // Store session in sessionStorage
      sessionStorage.setItem('currentSession', JSON.stringify(session));
      sessionStorage.setItem('currentJoinCode', session.join_code);
      setLoading(false);
      
      // Navigate to game if session is active, otherwise wait in lobby
      if (session.status === "active") {
        navigate(`/multiplayer-game/${session.session_id}`, {
          state: { session, joinCode: session.join_code }
        });
      } else {
        // Session is still waiting for more players
        navigate(`/multiplayer-waiting/${session.session_id}`, {
          state: { session, joinCode: session.join_code }
        });
      }
    } catch (err) {
      setError(err.message || "Failed to join room. Check your join code.");
      setLoading(false);
    }
  }

  function handleStartGame() {
    // This will be called when user clicks "Start Game" after creating room
    // Use the created session directly
    const sessionToUse = createdSession || JSON.parse(sessionStorage.getItem('createdSession') || 'null');
    
    if (sessionToUse && sessionToUse.session_id) {
      navigate(`/multiplayer-waiting/${sessionToUse.session_id}`, {
        state: { session: sessionToUse, joinCode: createdJoinCode || sessionToUse.join_code }
      });
    } else if (createdJoinCode) {
      // Fallback: try to load session by join code
      // But we need to make a route that handles join codes
      // For now, show error
      setError("Unable to navigate. Please refresh and try again.");
    } else {
      setError("Unable to navigate to waiting room. Please try creating the room again.");
    }
  }

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        {view === "menu" && (
          <>
            <h1>🎮 Multiplayer Lobby</h1>
            <p style={{ color: "#666", marginBottom: 30 }}>
              Create a room for others to join, or enter a code to join an existing game
            </p>

            <div className="lobby-buttons">
              <button 
                className="lobby-btn primary"
                onClick={() => setView("create")}
              >
                ➕ Create Room
              </button>
              
              <button 
                className="lobby-btn secondary"
                onClick={() => setView("join")}
              >
                🔑 Join Room
              </button>
            </div>

            <button 
              className="back-btn"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>
          </>
        )}

        {view === "create" && (
          <>
            <h2>Create a Room</h2>
            
            <div className="form-group">
              <label>Number of Players</label>
              <select 
                value={numberOfPlayers} 
                onChange={(e) => setNumberOfPlayers(parseInt(e.target.value))}
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Questions</label>
              <input 
                type="number" 
                min="5" 
                max="50" 
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-buttons">
              <button 
                className="lobby-btn primary"
                onClick={handleCreateRoom}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Room"}
              </button>
              
              <button 
                className="back-btn"
                onClick={() => {
                  setView("menu");
                  setError("");
                }}
              >
                ← Back
              </button>
            </div>
          </>
        )}

        {view === "created" && (
          <>
            <h2>✅ Room Created!</h2>
            
            <div className="join-code-display">
              <p>Share this code with your friends:</p>
              <div className="join-code">
                {createdJoinCode}
              </div>
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(createdJoinCode);
                  alert("Code copied to clipboard!");
                }}
              >
                📋 Copy Code
              </button>
            </div>

            <p style={{ color: "#666", marginTop: 20 }}>
              Waiting for {numberOfPlayers - 1} more player{numberOfPlayers - 1 > 1 ? 's' : ''}...
            </p>

            <button 
              className="lobby-btn primary"
              onClick={handleStartGame}
            >
              Go to Waiting Room
            </button>
          </>
        )}

        {view === "join" && (
          <>
            <h2>Join a Room</h2>
            
            <div className="form-group">
              <label>Enter Join Code</label>
              <input 
                type="text" 
                placeholder="ABC123"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                  setError("");
                }}
                maxLength={6}
                style={{ 
                  fontSize: 24, 
                  letterSpacing: 4, 
                  textAlign: "center",
                  textTransform: "uppercase"
                }}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-buttons">
              <button 
                className="lobby-btn primary"
                onClick={handleJoinRoom}
                disabled={loading || joinCode.length < 6}
              >
                {loading ? "Joining..." : "Join Room"}
              </button>
              
              <button 
                className="back-btn"
                onClick={() => {
                  setView("menu");
                  setError("");
                  setJoinCode("");
                }}
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

