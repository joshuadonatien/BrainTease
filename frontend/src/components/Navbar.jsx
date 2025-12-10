import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    alert("Logged out (mock for now)");
    navigate("/");
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

        {/* ✅ USER + LOGOUT */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>Guest</span>
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
        </div>
      </div>
    </>
  );
}
