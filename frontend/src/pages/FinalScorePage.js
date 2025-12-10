import { useNavigate, useLocation } from "react-router-dom";

export default function FinalScorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get score data from navigation state
  const score = location.state?.score || 0;
  const totalQuestions = location.state?.totalQuestions || 0;
  const correctCount = location.state?.correctCount || 0;
  const difficulty = location.state?.difficulty || "easy";
  const isTop5 = location.state?.isTop5 || false;
  const rank = location.state?.rank || null;

  return (
    <div style={{ 
      paddingTop: 100, 
      maxWidth: 600, 
      margin: "0 auto", 
      padding: 40,
      textAlign: "center"
    }}>
      <div style={{ 
        background: "white", 
        borderRadius: 16, 
        padding: 40,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ color: "#5b9491", marginBottom: 20 }}>🎉 Game Over!</h1>
        
        {isTop5 && (
          <div style={{
            background: "#fff9e6",
            border: "2px solid #FFD700",
            borderRadius: 12,
            padding: 20,
            marginBottom: 30,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🏆</div>
            <h2 style={{ color: "#FFD700", margin: 0 }}>
              Top {rank} Score!
            </h2>
            <p style={{ color: "#666", marginTop: 10 }}>
              Congratulations! You made it to the top 5 leaderboard!
            </p>
          </div>
        )}
        
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 48, fontWeight: "bold", color: "#5b9491", marginBottom: 10 }}>
            {score}
          </div>
          <div style={{ fontSize: 18, color: "#666" }}>
            {correctCount} out of {totalQuestions} correct
          </div>
          <div style={{ fontSize: 14, color: "#999", marginTop: 10 }}>
            Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
          <button
            onClick={() => navigate("/difficulty")}
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
            onClick={() => navigate("/leaderboard")}
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
            View Leaderboard
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
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
