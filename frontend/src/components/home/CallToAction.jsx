export default function CallToAction() {
    return (
      <div style={styles.container}>
        <h2>Ready to Test Your Knowledge?</h2>
        <p>Sign in to start playing and climb the leaderboards</p>
        <button style={styles.button}>Sign In to Play</button>
      </div>
    );
  }
  
  const styles = {
    container: {
      background: "#5b918c",
      color: "white",
      textAlign: "center",
      padding: 40,
      marginTop: 40
    },
    button: {
      marginTop: 15,
      padding: "10px 20px",
      borderRadius: 8,
      border: "none",
      fontWeight: "bold",
      cursor: "pointer"
    }
  };
  