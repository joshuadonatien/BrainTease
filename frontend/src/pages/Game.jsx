import { useEffect, useState } from "react";
import QuestionCard from "../components/QuestionCard";
import { fetchQuestions } from "../services/questionService";

export default function Game() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchQuestions().then(setQuestions);
  }, []);

  function handleAnswer(choice) {
    setIndex((prev) => prev + 1);
  }

  return (
    <div style={{ padding: 50 }}>
      <QuestionCard
        question={questions[index]}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
