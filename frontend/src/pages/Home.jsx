import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        paddingTop: 80,   // ✅ PUSH BELOW NAVBAR
        paddingLeft: 0,
        minHeight: "100vh", // ✅ PREVENT BUTTON CUTOFF
        boxSizing: "border-box",
      }}
    >

      {/* ✅ HERO SECTION */}
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 48 }}>🧠</div>
        <h1 style={{ fontSize: 42, marginBottom: 10 }}>BrainTeaser</h1>
        <p style={{ fontSize: 18, color: "#666" }}>
          Challenge your mind with engaging trivia across multiple categories
        </p>
      </div>

      {/* ✅ MAIN FEATURE CARDS */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 20,
        padding: "20px",
        flexWrap: "wrap"
      }}>

        <div onClick={() => navigate("/difficulty")} style={cardStyle}>
          🎮
          <h3>CHOOSE GAME</h3>
          <p>Start a new trivia game with difficulty levels</p>
        </div>

        <div style={cardStyle}>
          📤
          <h3>SHARE</h3>
          <p>Share your results and challenge friends</p>
        </div>

        <div onClick={() => navigate("/lobby")} style={cardStyle}>
          👥
          <h3>MULTI-PLAYER</h3>
          <p>Compete with other players in real-time</p>
        </div>
      </div>

      {/* ✅ WHY PLAY SECTION */}
      <div style={{
        marginTop: 60,
        background: "#f9f9f9",
        padding: 40,
        borderRadius: 12,
        maxWidth: 1000,
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        <h2>Why Play BrainTease?</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>

          <div>📚 <strong>Multiple Categories</strong><br />
            Test your knowledge across science, history, literature, and more
          </div>

          <div>🎯 <strong>Difficulty Levels</strong><br />
            Choose easy, medium, or hard to match your skill level
          </div>

          <div>💡 <strong>Helpful Hints</strong><br />
            Use limited hints to help guide you toward the answer
          </div>

          <div>🏆 <strong>Leaderboards</strong><br />
            Track your progress and compete with players worldwide
          </div>

        </div>
      </div>

      {/* ✅ CTA SECTION */}
      <div style={{
        marginTop: 60,
        background: "#5b9491",
        color: "white",
        padding: 50,
        textAlign: "center"
      }}>
        <h2>Ready to Test Your Knowledge?</h2>
        <p>Play as a guest or sign in to track your scores and compete on leaderboards!</p>

        <button
          onClick={() => navigate("/difficulty")}
          style={{
            marginTop: 20,
            padding: "14px 32px",
            fontSize: 18,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            color: "#5b9491"
          }}
        >
          Choose Game
        </button>
      </div>

    </div>
  );
}

const cardStyle = {
  width: 260,
  background: "white",
  padding: 30,
  borderRadius: 12,
  textAlign: "center",
  cursor: "pointer",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)"
};
