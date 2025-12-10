import React, { useState } from "react";
import HintButton from "./HintButton";
import "./GamePage.css";

export default function QuestionCard({ question, onAnswer, sessionId, allowedHints, hintsUsed, onHintUsed }) {
  const [hiddenOption, setHiddenOption] = useState(null);

  if (!question) return null;

  return (
    <div className="question-card fade-in">
      <h2>{question.question}</h2>

      <div className="options-grid">
        {question.options.map((opt, idx) => {
          if (idx === hiddenOption) return null;

          return (
            <button
              key={idx}
              className="answer-btn"
              onClick={() => onAnswer(idx)}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <HintButton
        options={question.options}
        answerIndex={question.answer}
        onHint={setHiddenOption}
        sessionId={sessionId}
        allowedHints={allowedHints}
        hintsUsed={hintsUsed}
        onHintUsed={onHintUsed}
      />
    </div>
  );
}
