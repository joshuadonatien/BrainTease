import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMultiplayerSession, getMultiplayerSessionById } from "../services/multiplayerService";
import Loader from "../components/Loader";

export default function MultiplayerWaiting() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [session, setSession] = useState(location.state?.session || null);
  const [joinCode, setJoinCode] = useState(
    location.state?.joinCode || 
    sessionStorage.getItem('createdJoinCode') || 
    sessionStorage.getItem('currentJoinCode') || 
    ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // If we're coming from "created" room, we need to get the session by join code
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    async function loadSession() {
      try {
        let sessionData = null;
        
        // Priority 1: Use session from location state
        if (location.state?.session) {
          sessionData = location.state.session;
        }
        // Priority 2: Try to get from sessionStorage
        else {
          const storedSession = sessionStorage.getItem('createdSession') || sessionStorage.getItem('currentSession');
          if (storedSession) {
            try {
              sessionData = JSON.parse(storedSession);
            } catch (e) {
              console.error("Error parsing stored session:", e);
            }
          }
        }
        
        // Priority 3: Load by session ID (UUID)
        if (!sessionData && sessionId && sessionId !== "created") {
          try {
            sessionData = await getMultiplayerSessionById(sessionId);
          } catch (e) {
            console.error("Error loading by session ID:", e);
          }
        }
        
        // Priority 4: Load by join code
        const codeToUse = joinCode || location.state?.joinCode || sessionStorage.getItem('createdJoinCode');
        if (!sessionData && codeToUse) {
          try {
            sessionData = await getMultiplayerSession(codeToUse);
          } catch (e) {
            console.error("Error loading by join code:", e);
          }
        }
        
        if (!sessionData) {
          setError("Invalid session - missing session ID or join code");
          setLoading(false);
          return;
        }
        
        setSession(sessionData);
        if (sessionData.join_code) {
          setJoinCode(sessionData.join_code);
        }
        // Update sessionStorage
        sessionStorage.setItem('currentSession', JSON.stringify(sessionData));
        if (sessionData.join_code) {
          sessionStorage.setItem('createdJoinCode', sessionData.join_code);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading session:", err);
        setError(err.message || "Failed to load session");
        setLoading(false);
      }
    }

    // Always load session to get latest state
    loadSession();
  }, [sessionId, navigate, location.state, joinCode]);

  // Poll for session updates
  useEffect(() => {
    if (!session || session.status === "active" || session.status === "finished") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const sessionData = await getMultiplayerSession(joinCode);
        setSession(sessionData);
        
            // If session is now active, navigate to game
            if (sessionData.status === "active") {
              navigate(`/multiplayer-game/${sessionData.session_id}`, {
                state: { session: sessionData, joinCode }
              });
            }
      } catch (err) {
        console.error("Error polling session:", err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [session, joinCode, navigate]);

  if (loading) {
    return <Loader />;
  }

  if (error || !session) {
    return (
      <div style={{ paddingTop: 100, textAlign: "center" }}>
        <div className="error-message">{error || "Session not found"}</div>
        <button onClick={() => navigate("/lobby")}>Back to Lobby</button>
      </div>
    );
  }

  const playersNeeded = session.number_of_players - session.current_players;
  const isWaiting = session.status === "waiting";

  return (
    <div style={{ paddingTop: 100, maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <div style={{ 
        background: "white", 
        borderRadius: 16, 
        padding: 40, 
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)" 
      }}>
        <h1 style={{ textAlign: "center", color: "#5b9491" }}>
          {isWaiting ? "⏳ Waiting for Players" : "✅ Game Starting!"}
        </h1>

        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <p style={{ color: "#666", fontSize: 14 }}>Room Code</p>
          <div style={{
            fontSize: 36,
            fontWeight: "bold",
            letterSpacing: 6,
            color: "#5b9491",
            background: "#f0f9f8",
            padding: "15px 30px",
            borderRadius: 12,
            display: "inline-block",
            fontFamily: "monospace"
          }}>
            {joinCode}
          </div>
        </div>

        <div style={{ margin: "30px 0" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: 20
          }}>
            <span style={{ fontSize: 18, fontWeight: 500 }}>Players</span>
            <span style={{ 
              fontSize: 18, 
              color: "#5b9491", 
              fontWeight: "bold" 
            }}>
              {session.current_players} / {session.number_of_players}
            </span>
          </div>

          <div style={{ 
            background: "#f5f5f5", 
            borderRadius: 8, 
            height: 30, 
            overflow: "hidden",
            marginBottom: 20
          }}>
            <div style={{
              background: "#5b9491",
              height: "100%",
              width: `${(session.current_players / session.number_of_players) * 100}%`,
              transition: "width 0.3s"
            }} />
          </div>

          <div style={{ marginTop: 20 }}>
            {session.players.map((playerId, index) => (
              <div 
                key={playerId}
                style={{
                  padding: "10px 15px",
                  background: index % 2 === 0 ? "#f9f9f9" : "white",
                  borderRadius: 8,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <span style={{ marginRight: 10 }}>👤</span>
                <span>{playerId.slice(0, 8)}...</span>
                {index === 0 && (
                  <span style={{ 
                    marginLeft: "auto", 
                    fontSize: 12, 
                    color: "#5b9491" 
                  }}>
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isWaiting && (
          <div style={{ 
            textAlign: "center", 
            padding: 20, 
            background: "#fff3cd", 
            borderRadius: 8,
            marginBottom: 20
          }}>
            <p style={{ margin: 0, color: "#856404" }}>
              {playersNeeded} more player{playersNeeded > 1 ? 's' : ''} needed to start
            </p>
          </div>
        )}

        {session.status === "active" && (
          <div style={{ 
            textAlign: "center", 
            padding: 20, 
            background: "#d4edda", 
            borderRadius: 8,
            marginBottom: 20
          }}>
            <p style={{ margin: 0, color: "#155724" }}>
              All players joined! Game starting...
            </p>
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate("/lobby")}
            style={{
              padding: "12px 24px",
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            ← Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

