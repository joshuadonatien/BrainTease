import { useState } from "react";
import { apiPost } from "../services/api";

export default function HintButton({ 
  options, 
  answerIndex, 
  onHint, 
  sessionId, 
  allowedHints, 
  hintsUsed, 
  onHintUsed 
}) {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  async function giveHint() {
    if (!sessionId) {
      // Fallback to client-side hint if no session
      const wrongOptions = options
        .map((opt, i) => i)
        .filter((i) => i !== answerIndex);
      
      const removed = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      onHint(removed);
      return;
    }

    if (hintsUsed >= allowedHints) {
      alert("No hints remaining!");
      return;
    }

    setLoading(true);
    setDisabled(true);

    try {
      // Get incorrect answers (all options except the correct one)
      const correctAnswer = options[answerIndex];
      const incorrectAnswers = options.filter((opt, idx) => idx !== answerIndex);

      // Call use-hint API
      const result = await apiPost(`/use-hint/${sessionId}/`, {
        correct_answer: correctAnswer,
        incorrect_answers: incorrectAnswers,
      });

      // Remove the hint from UI - API returns removed_answer
      const removedAnswer = result.removed_answer;
      if (removedAnswer) {
        const removedIndex = options.findIndex(opt => opt === removedAnswer);
        if (removedIndex !== -1) {
          onHint(removedIndex);
        }
      }

      // Update hint count
      if (onHintUsed) {
        onHintUsed();
      }
    } catch (err) {
      console.error("Failed to use hint:", err);
      alert(err.message || "Failed to use hint");
      setDisabled(false);
    } finally {
      setLoading(false);
    }
  }

  const hintsRemaining = allowedHints - hintsUsed;
  const canUseHint = sessionId && hintsRemaining > 0 && !disabled;

  return (
    <button 
      onClick={giveHint} 
      className="hint-btn"
      disabled={!canUseHint && !sessionId}
      style={{
        opacity: canUseHint || !sessionId ? 1 : 0.5,
        cursor: canUseHint || !sessionId ? "pointer" : "not-allowed"
      }}
    >
      {loading ? "..." : "💡 Hint"}
      {sessionId && ` (${hintsRemaining} left)`}
    </button>
  );
}
  