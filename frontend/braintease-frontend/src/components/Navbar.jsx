import { Link } from "react-router-dom";
import "./Navbar.css";


export default function Navbar() {
    return (
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="nav-logo">BrainTease</Link>
        </div>
  
        <div className="nav-links">
          <Link to="/game">Play</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>
    );
  }
