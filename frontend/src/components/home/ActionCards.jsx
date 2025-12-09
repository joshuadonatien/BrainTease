export default function ActionCards() {
    const cards = [
      { title: "Choose Game", text: "Start a new trivia game with difficulty levels", icon: "🎮" },
      { title: "Share", text: "Share your results and challenge friends", icon: "📤" },
      { title: "Multi-Player", text: "Compete with other players in real time", icon: "👥" }
    ];
  
    return (
      <div style={styles.container}>
        {cards.map((card, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.icon}>{card.icon}</div>
            <h3>{card.title.toUpperCase()}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>
    );
  }
  
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      gap: 20,
      flexWrap: "wrap"
    },
    card: {
      width: 260,
      padding: 20,
      borderRadius: 10,
      boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
      textAlign: "center"
    },
    icon: {
      fontSize: 30
    }
  };
  