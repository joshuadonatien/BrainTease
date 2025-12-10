export default function FeaturesSection() {
    const features = [
      { title: "Multiple Categories", desc: "Test knowledge across science, history, and more", icon: "📚" },
      { title: "Difficulty Levels", desc: "Choose easy, medium, or hard", icon: "🎯" },
      { title: "Helpful Hints", desc: "Limited hints to guide you", icon: "💡" },
      { title: "Leaderboards", desc: "Compete with others worldwide", icon: "🏆" }
    ];
  
    return (
      <div style={styles.container}>
        <h2>Why Play BrainTease?</h2>
        <div style={styles.grid}>
          {features.map((f, i) => (
            <div key={i} style={styles.item}>
              <span style={styles.icon}>{f.icon}</span>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const styles = {
    container: {
      padding: 40
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: 20
    },
    item: {
      display: "flex",
      gap: 10,
      alignItems: "center"
    },
    icon: {
      fontSize: 24
    }
  };
  
