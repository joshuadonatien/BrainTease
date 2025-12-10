import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);
    
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  function handleBackClick() {
    navigate("/");
  }

  return (
    <div style={styles.page}>
      <div style={styles.back} onClick={handleBackClick}>← Back</div>

      <div style={styles.card}>
        <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
        <p style={styles.subtitle}>
          {isSignUp ? "Create an account to get started" : "Enter your credentials to continue"}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <label>Display Name</label>
              <div style={styles.inputWrap}>
                <span>👤</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  required
                />
              </div>
            </>
          )}

          <label>Email</label>
          <div style={styles.inputWrap}>
            <span>✉️</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <label>Password</label>
          <div style={styles.inputWrap}>
            <span>🔒</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <button style={styles.signInBtn} disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div style={styles.divider}>Or continue with</div>

        <button style={styles.googleBtn} onClick={handleGoogleSignIn} disabled={loading}>
          <span>G</span> Sign in with Google
        </button>

        <p style={styles.footer}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span 
            style={styles.link} 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },

  back: {
    position: "absolute",
    top: 20,
    left: 20,
    fontSize: 16,
    color: "#5b918c",
    cursor: "pointer"
  },

  card: {
    width: 360,
    background: "white",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0px 10px 30px rgba(0,0,0,0.1)"
  },

  subtitle: {
    color: "#777",
    fontSize: 14,
    marginBottom: 20
  },

  error: {
    color: "#f44336",
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
    fontSize: 14
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: "2px solid #ddd",
    borderRadius: 8,
    padding: "12px 15px",
    marginBottom: 15,
    backgroundColor: "#fff"
  },

  signInBtn: {
    width: "100%",
    padding: 15,
    backgroundColor: "#5b918c",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 20,
    transition: "background-color 0.2s"
  },

  divider: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    margin: "20px 0",
    position: "relative"
  },

  googleBtn: {
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    color: "#333",
    border: "2px solid #ddd",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    transition: "border-color 0.2s"
  },

  footer: {
    textAlign: "center",
    color: "#666",
    fontSize: 14
  },

  link: {
    color: "#5b918c",
    cursor: "pointer",
    fontWeight: 600
  }
};