import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const { login, signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
      navigate("/"); // Redirect to home after successful login
    } catch (error) {
      setError("Failed to " + (isSignUp ? "create account" : "sign in") + ": " + error.message);
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      navigate("/"); // Redirect to home after successful login
    } catch (error) {
      setError("Failed to sign in with Google: " + error.message);
    }

    setLoading(false);
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

          <button type="submit" style={styles.signInBtn} disabled={loading}>
            {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
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
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
              required
            />
          </div>

          <button style={styles.signInBtn}>Sign In</button>
        </form>

        <div style={styles.divider}>Or continue with</div>

        <button style={styles.googleBtn}>
          <span>G</span> Sign in with Google
        </button>

        <p style={styles.footer}>
          Don&apos;t have an account? <span style={styles.link}>Sign up</span>
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
    marginBottom: 20
  },

  error: {
    background: "#fdecea",
    color: "#b91c1c",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    fontSize: 14
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f1f5fb",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 15
  },

  signInBtn: {
    width: "100%",
    background: "#5b918c",
    color: "white",
    border: "none",
    padding: "12px 0",
    borderRadius: 8,
    marginTop: 10,
    fontWeight: "bold",
    cursor: "pointer"
  },

  divider: {
    textAlign: "center",
    margin: "20px 0",
    color: "#aaa",
    fontSize: 14
  },

  googleBtn: {
    width: "100%",
    padding: "10px 0",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  footer: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14
  },

  link: {
    color: "#5b918c",
    fontWeight: "bold",
    cursor: "pointer"
  }
};
