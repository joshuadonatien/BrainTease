import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "12px", background: "#efefef" }}>
      <Link to="/" style={{ marginRight: "12px" }}>Home</Link>
      <Link to="/login" style={{ marginRight: "12px" }}>Login</Link>
      <Link to="/game" style={{ marginRight: "12px" }}>Game</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}
