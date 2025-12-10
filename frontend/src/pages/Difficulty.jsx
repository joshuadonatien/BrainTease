import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "../services/categoryService";

export default function DifficultySelect() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("easy");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  function handleCategoryToggle(categoryId) {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }

  function handleStartGame() {
    const params = new URLSearchParams({ difficulty });
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }
    navigate(`/game?${params.toString()}`);
  }

  return (
    <div style={{ paddingTop: 100, maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <div style={{ 
        background: "white", 
        borderRadius: 16, 
        padding: 40,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ color: "#5b9491", marginBottom: 10 }}>Set Up Your Game</h1>
        <p style={{ color: "#666", marginBottom: 30 }}>Choose your difficulty and categories</p>

        {/* Difficulty Selection */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ marginBottom: 15 }}>Select Difficulty</h3>
          <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
            {["easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                style={{
                  ...btnStyle,
                  background: difficulty === diff ? "#5b9491" : "white",
                  color: difficulty === diff ? "white" : "black",
                  border: `2px solid ${difficulty === diff ? "#5b9491" : "#ddd"}`,
                }}
                onClick={() => setDifficulty(diff)}
              >
                {diff === "easy" && "🌱"} 
                {diff === "medium" && "🔥"} 
                {diff === "hard" && "💎"} 
                {" "}
                {diff.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ marginBottom: 15 }}>Select Categories (Optional)</h3>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 15 }}>
            Leave empty to play all categories
          </p>
          {loading ? (
            <div>Loading categories...</div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
              gap: 10,
              maxHeight: 300,
              overflowY: "auto",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8
            }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  style={{
                    padding: "10px 15px",
                    borderRadius: 8,
                    border: `2px solid ${selectedCategories.includes(cat.id) ? "#5b9491" : "#ddd"}`,
                    background: selectedCategories.includes(cat.id) ? "#f0f9f8" : "white",
                    color: selectedCategories.includes(cat.id) ? "#5b9491" : "#333",
                    cursor: "pointer",
                    fontSize: 14,
                    textAlign: "left"
                  }}
                  onClick={() => handleCategoryToggle(cat.id)}
                >
                  {selectedCategories.includes(cat.id) && "✓ "}
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Start Game Button */}
        <button
          style={{
            width: "100%",
            padding: "16px",
            background: "#5b9491",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 18,
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: 20
          }}
          onClick={handleStartGame}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "20px 40px",
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 18,
  fontWeight: "bold",
  cursor: "pointer",
  background: "white",
  color: "black" // 
};
