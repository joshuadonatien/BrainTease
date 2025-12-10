import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getMultiplayerSessionById } from "../services/multiplayerService";

export default function MultiplayerWaitingResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(location.state?.session || null);
  const [loading, setLoading] = useState(!session);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const sessionData = await getMultiplayerSessionById(sessionId);
        setSession(sessionData);
        
        if (sessionData.status === "finished") {
          clearInterval(interval);
          navigate(`/multiplayer-results/${sessionId}`, {
            state: { session: sessionData }
          });
        }
      } catch (err) {
        console.error("Error polling session:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, navigate]);

  if (loading && !session) {
    return <div style={{ paddingTop: 100, textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ paddingTop: 100, maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <div style={{ 
        background: "white", 
        borderRadius: 16, 
        padding: 40, 
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        textAlign: "center"
      }}>
        <h1 style={{ color: "#5b9491" }}>⏳ Waiting for Results</h1>
        <p style={{ color: "#666", marginTop: 20 }}>
          You've finished! Waiting for other players to complete the game...
        </p>
        <div style={{ marginTop: 30 }}>
          <div className="loader"></div>
        </div>
        <button
          onClick={() => navigate("/lobby")}
          style={{
            marginTop: 30,
            padding: "12px 24px",
            background: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
}

