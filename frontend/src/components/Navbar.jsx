import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function handleSignIn() {
    navigate("/login");
  }

  return (
    <>
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div
        style={{
          height: 60,
          background: "#5b9491",
          color: "white",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          justifyContent: "space-between",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        {/* ✅ HAMBURGER */}
        <button
          onClick={() => setOpen(true)}
          style={{
            fontSize: 28,
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          ☰
        </button>

        {/* ✅ LOGO */}
        <h2 style={{ margin: 0 }}>BrainTeaser</h2>

        {/* ✅ USER AUTHENTICATION SECTION */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {currentUser ? (
            // Show user info and logout when authenticated
            <>
              <span>Hello, {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
              <button
                onClick={handleLogout}
                style={{
                  background: "white",
                  color: "#5b9491",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            // Show guest status and sign in option
            <>
              <span style={{ fontSize: 14, opacity: 0.9 }}>Playing as Guest</span>
              <button
                onClick={handleSignIn}
                style={{
                  background: "white",
                  color: "#5b9491",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
