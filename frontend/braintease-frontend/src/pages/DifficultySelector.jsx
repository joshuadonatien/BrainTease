import { useGame } from "../context/GameContext";
import { useNavigate } from "react-router-dom";

const DifficultySelector = () => {
  const { setDifficulty } = useGame();
  const navigate = useNavigate();

  const chooseDifficulty = (level) => {
    setDifficulty(level);
    navigate("/game");
  };

  return (
    <div className="difficulty-selector">
      <h2>Select Difficulty</h2>
      <button onClick={() => chooseDifficulty("easy")}>Easy</button>
      <button onClick={() => chooseDifficulty("medium")}>Medium</button>
      <button onClick={() => chooseDifficulty("hard")}>Hard</button>
    </div>
  );
};

export default DifficultySelector;
