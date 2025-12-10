// import { Link } from "react-router-dom";
// import "./Navbar.css";


// export default function Navbar() {
//     return (
//       <nav className="navbar">
//         <div className="nav-left">
//           <Link to="/" className="nav-logo">BrainTease</Link>
//         </div>
  
//         <div className="nav-links">
//           <Link to="/game">Play</Link>
//           <Link to="/leaderboard">Leaderboard</Link>
//           <Link to="/profile">Profile</Link>
//           <Link to="/login">Login</Link>
//         </div>
//       </nav>
//     );
//   }
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">BrainTease</Link>
      </div>

      <div className="nav-links">
        <Link to="/game">Play</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        {currentUser ? (
          <Link to="/profile">Profile ({currentUser.displayName || currentUser.email})</Link>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}