export default function HeroSection() {
    return (
      <div style={styles.container}>
        <div style={styles.logo}>🧠</div>
        <h1 style={styles.title}>BrainTeaser</h1>
        <p style={styles.subtitle}>
          Challenge your mind with engaging trivia across multiple categories
        </p>
      </div>
    );
  }
  
  const styles = {
    container: {
      textAlign: "center",
      padding: "60px 20px"
    },
    logo: {
      fontSize: 48
    },
    title: {
      fontSize: 36,
      marginBottom: 10
    },
    subtitle: {
      fontSize: 16,
      color: "#666"
    }
  };
  