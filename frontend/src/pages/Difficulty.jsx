import { useNavigate } from "react-router-dom";

export default function DifficultySelect() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h1>Set Up Your Game</h1>
      <h3>Select Difficulty</h3>

      <div style={{ display: "flex", gap: 20 }}>

        <button style={btnStyle} onClick={() => navigate("/game?difficulty=easy")}>
          🌱 EASY
        </button>

        <button style={btnStyle} onClick={() => navigate("/game?difficulty=medium")}>
          🔥 MEDIUM
        </button>

        <button style={btnStyle} onClick={() => navigate("/game?difficulty=hard")}>
          💎 HARD
        </button>

      </div>
    </div>
  );
}

const btnStyle = {
  padding: "20px 40px",
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 18,
  fontWeight: "bold",
  cursor: "pointer",
  background: "white",
  color: "black" // 
};
