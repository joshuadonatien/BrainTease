import { useEffect } from "react";
import { useGame } from "../context/GameContext";
import { submitScore } from "../services/scoreService";

export default function FinalScorePage() {
  const { score } = useGame();

  useEffect(() => {
    submitScore(score);
  }, []);

  return (
    <div className="final-score">
      <h1>Your Score: {score}</h1>
      <button onClick={() => (window.location.href = "/game")}>
        Play Again
      </button>
    </div>
  );
}
