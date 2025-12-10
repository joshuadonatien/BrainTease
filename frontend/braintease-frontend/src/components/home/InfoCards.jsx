export default function InfoCards() {
    return (
      <div style={styles.container}>
        <div style={styles.auth}>
          👤 Authentication Flow  
          <p>See how Google sign-in works</p>
        </div>
  
        <div style={styles.leaderboard}>
          🏆 Leaderboard  
          <p>Track your personal rankings</p>
        </div>
      </div>
    );
  }
  
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      gap: 20,
      padding: 30,
      flexWrap: "wrap"
    },
    auth: {
      border: "2px solid #87b",
      padding: 20,
      borderRadius: 10,
      width: 280
    },
    leaderboard: {
      border: "2px solid #8b7",
      padding: 20,
      borderRadius: 10,
      width: 280
    }
  };
  