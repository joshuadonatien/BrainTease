import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import GamePage from "./pages/GamePage";
import Difficulty from "./pages/Difficulty";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import MultiplayerWaiting from "./pages/MultiplayerWaiting";
import MultiplayerGame from "./pages/MultiplayerGame";
import MultiplayerResults from "./pages/MultiplayerResults";
import MultiplayerWaitingResults from "./pages/MultiplayerWaitingResults";

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
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/multiplayer-waiting/:sessionId" element={<MultiplayerWaiting />} />
          <Route path="/multiplayer-waiting" element={<MultiplayerWaiting />} />
          <Route path="/multiplayer-game/:sessionId" element={<MultiplayerGame />} />
          <Route path="/multiplayer-results/:sessionId" element={<MultiplayerResults />} />
          <Route path="/multiplayer-waiting-results/:sessionId" element={<MultiplayerWaitingResults />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
