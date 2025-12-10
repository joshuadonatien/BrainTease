import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMultiplayerSessionById } from "../services/multiplayerService";

export default function MultiplayerResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [session, setSession] = useState(location.state?.session || null);
  const [loading, setLoading] = useState(!session);

  useEffect(() => {
    async function loadSession() {
      try {
        if (!session) {
          const sessionData = await getMultiplayerSessionById(sessionId);
          setSession(sessionData);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading session:", err);
        setLoading(false);
      }
    }

    if (!session) {
      loadSession();
    }
  }, [session, sessionId]);

  if (loading) {
    return <div style={{ paddingTop: 100, textAlign: "center" }}>Loading results...</div>;
  }

  if (!session || session.status !== "finished") {
    return (
      <div style={{ paddingTop: 100, textAlign: "center" }}>
        <p>Game not finished yet. Waiting for other players...</p>
        <button onClick={() => navigate("/lobby")}>Back to Lobby</button>
      </div>
    );
  }

  const currentUserId = user?.uid;
  const isWinner = session.winners?.includes(currentUserId);
  const playerScores = Object.entries(session.player_scores || {})
    .map(([userId, data]) => ({
      userId,
      ...data,
      isCurrentUser: userId === currentUserId,
      isWinner: session.winners?.includes(userId),
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div style={{ paddingTop: 100, maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <div style={{ 
        background: "white", 
        borderRadius: 16, 
        padding: 40,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {isWinner ? (
            <>
              <h1 style={{ color: "#FFD700", fontSize: 64, margin: 0 }}>🏆</h1>
              <h1 style={{ color: "#5b9491" }}>You Won!</h1>
            </>
          ) : (
            <>
              <h1 style={{ color: "#5b9491" }}>Game Over</h1>
              <p style={{ color: "#666" }}>Thanks for playing!</p>
            </>
          )}
        </div>

        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Final Scores</h2>

        <div style={{ marginBottom: 30 }}>
          {playerScores.map((player, index) => (
            <div
              key={player.userId}
              style={{
                padding: 20,
                background: player.isCurrentUser 
                  ? "#f0f9f8" 
                  : player.isWinner 
                    ? "#fff9e6" 
                    : index % 2 === 0 
                      ? "#f9f9f9" 
                      : "white",
                borderRadius: 12,
                marginBottom: 12,
                border: player.isCurrentUser ? "2px solid #5b9491" : "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <div style={{ fontSize: 24 }}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                </div>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 18 }}>
                    {player.display_name || player.userId.slice(0, 8) + "..."}
                    {player.isCurrentUser && (
                      <span style={{ marginLeft: 8, color: "#5b9491" }}>(You)</span>
                    )}
                    {player.isWinner && (
                      <span style={{ marginLeft: 8, color: "#FFD700" }}>👑</span>
                    )}
                  </div>
                  {player.correct_count !== null && player.total_questions && (
                    <div style={{ fontSize: 14, color: "#666" }}>
                      {player.correct_count} / {player.total_questions} correct
                      {player.time_taken_seconds && (
                        <span> • {player.time_taken_seconds}s</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ 
                fontSize: 24, 
                fontWeight: "bold", 
                color: "#5b9491" 
              }}>
                {player.score || 0}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
          <button
            onClick={() => navigate("/lobby")}
            style={{
              padding: "14px 28px",
              background: "#5b9491",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "bold"
            }}
          >
            Play Again
          </button>
          
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "14px 28px",
              background: "#f5f5f5",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

