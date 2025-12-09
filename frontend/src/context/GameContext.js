import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [usedHint, setUsedHint] = useState(false);

  const currentQuestion = questions[index];

  const nextQuestion = () => {
    setIndex((prev) => prev + 1);
    setUsedHint(false);
  };

  const addScore = (points) => {
    setScore((prev) => prev + points);
  };

  return (
    <GameContext.Provider
      value={{
        questions,
        setQuestions,
        index,
        currentQuestion,
        nextQuestion,
        score,
        addScore,
        usedHint,
        setUsedHint
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
