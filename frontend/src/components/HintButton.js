export default function HintButton({ options, answerIndex, onHint }) {
    function giveHint() {
      const wrongOptions = options
        .map((opt, i) => i)
        .filter((i) => i !== answerIndex);
  
      const removed =
        wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
  
      onHint(removed);
    }
  
    return (
      <button onClick={giveHint} className="hint-btn">
        💡 Hint
      </button>
    );
  }
  