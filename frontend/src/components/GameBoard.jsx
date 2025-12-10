import QuestionCard from "./QuestionCard";

export default function GameBoard({ difficulty }) {
  return (
    <div className="game-board">
      <h3>Difficulty: {difficulty}</h3>

      {/* Placeholder question card */}
      <QuestionCard
        question="Loading question..."
        answers={[]}
      />
    </div>
  );
}
