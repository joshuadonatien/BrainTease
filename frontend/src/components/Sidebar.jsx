import { useNavigate } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  return (
    <>
      {/* ✅ OVERLAY */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 998,
          }}
        />
      )}

      {/* ✅ WHITE DESIGN SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          width: 280,
          height: "100vh",
          background: "white",
          boxShadow: "4px 0px 20px rgba(0,0,0,0.15)",
          padding: 20,
          transition: "transform 0.3s ease",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ✅ USER HEADER */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#5b9491",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              marginRight: 12,
            }}
          >
            G
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>Guest</div>
            <div style={{ fontSize: 12, color: "#777" }}>Switch Account</div>
          </div>
        </div>

        {/* ✅ MAIN MENU */}
        <div style={{ flex: 1 }}>
          <NavItem label="Home" onClick={() => go(navigate, "/", onClose)} />
          <NavItem label="Play Game" onClick={() => go(navigate, "/difficulty", onClose)} />
          <NavItem label="Multiplayer" />
          <NavItem label="Share Results" />
          <NavItem label="Leaderboard" onClick={() => go(navigate, "/leaderboard", onClose)} />

          <div style={{ marginTop: 30, fontSize: 12, color: "#aaa" }}>
            DEMO PAGES
          </div>

          <NavItem label="Authentication Flow" />
          <NavItem label="Sample Leaderboard" />
        </div>
      </div>
    </>
  );
}

/* ✅ CLEAN NAV BUTTON */
function NavItem({ label, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 8px",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 15,
        color: "#333",
      }}
    >
      {label}
    </div>
  );
}

/* ✅ SAFE NAVIGATION */
function go(navigate, path, close) {
  navigate(path);
  close();
}
