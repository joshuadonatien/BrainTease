import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import GamePage from "./pages/GamePage";
import Difficulty from "./pages/Difficulty";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* ✅ NAVBAR IS NOW GLOBAL */}
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/difficulty" element={<Difficulty />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
