import { useNavigate, useLocation } from "react-router-dom";
import GameOver from "../components/GameOver";

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

  const handlePlayAgain = () => {
    navigate("/difficulty");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <GameOver
      score={score}
      totalQuestions={totalQuestions}
      difficulty={difficulty}
      onPlayAgain={handlePlayAgain}
      onGoHome={handleGoHome}
      isTop5={isTop5}
      rank={rank}
    />
  );
}
