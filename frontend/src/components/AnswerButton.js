export default function AnswerButton({ text, onClick }) {
    return (
      <button className="answer-button" onClick={onClick}>
        {text}
      </button>
    );
  }
  