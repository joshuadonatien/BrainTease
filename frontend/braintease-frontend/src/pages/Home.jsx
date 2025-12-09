import { Link } from "react-router-dom";
import "./Home.css";
import DifficultySelector from "./DifficultySelector";

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to BrainTease</h1>
      <p className="home-subtitle">
        Sharpen your mind with quick, fun, and challenging trivia rounds!
      </p>

      <div className="home-buttons">
        <Link to="/game" className="btn-primary">Start Game</Link>
        <Link to="/leaderboard" className="btn-secondary">Leaderboard</Link>
      </div>
      <div>
      <h1>BrainTease</h1>
      <DifficultySelector />
    </div>

      <div className="home-info">
        <h3>How it works</h3>
        <ul>
          <li>Choose your difficulty</li>
          <li>Answer 10 questions</li>
          <li>Compete for the top score</li>
        </ul>
      </div>
    </div>
  );
}
