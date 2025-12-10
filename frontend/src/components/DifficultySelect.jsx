export default function DifficultySelect({ onSelect }) {
    const levels = ["Easy", "Medium", "Hard"];
  
    return (
      <div style={{ display: "flex", gap: 20 }}>
        {levels.map((lvl) => (
          <div
            key={lvl}
            className="card"
            style={{ textAlign: "center", cursor: "pointer" }}
            onClick={() => onSelect(lvl.toLowerCase())}
          >
            <h3>{lvl}</h3>
          </div>
        ))}
      </div>
    );
  }
  