import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Leaderboard from "./components/Leaderboard";
import DifficultySelector from "./pages/DifficultySelector";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/game" element={<Game />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/select-difficulty" element={<DifficultySelector />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
