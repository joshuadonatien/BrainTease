import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    recentGames: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  function loadUserData() {
    // Load user from localStorage (will be replaced with Firebase)
    const savedUser = localStorage.getItem('user');
    
    if (!savedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);

    // Load user stats (mock data for now - will come from Django backend)
    const mockStats = {
      gamesPlayed: 15,
      totalScore: 128,
      averageScore: 8.5,
      bestScore: 10,
      recentGames: [
        { id: 1, score: 9, total: 10, difficulty: 'hard', date: '2024-12-09' },
        { id: 2, score: 8, total: 10, difficulty: 'medium', date: '2024-12-08' },
        { id: 3, score: 10, total: 10, difficulty: 'easy', date: '2024-12-07' },
        { id: 4, score: 7, total: 10, difficulty: 'hard', date: '2024-12-06' },
        { id: 5, score: 9, total: 10, difficulty: 'medium', date: '2024-12-05' }
      ]
    };

    setStats(mockStats);
    setLoading(false);
  }

  function handleLogout() {
    // TODO: Replace with Firebase logout
    // await signOut(auth);
    
    localStorage.removeItem('user');
    navigate('/login');
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2196F3',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'white',
            color: '#2196F3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>
            {user?.username || 'User'}
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: '#2196F3',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Games Played
          </p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>
            {stats.gamesPlayed}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Total Score
          </p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
            {stats.totalScore}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Average Score
          </p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>
            {stats.averageScore.toFixed(1)}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Best Score
          </p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>
            {stats.bestScore}/10
          </p>
        </div>
      </div>

      {/* Recent Games */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Recent Games</h2>
        </div>

        <div>
          {stats.recentGames.map((game, index) => {
            const percentage = Math.round((game.score / game.total) * 100);
            
            return (
              <div
                key={game.id}
                style={{
                  padding: '20px',
                  borderBottom: index < stats.recentGames.length - 1 ? '1px solid #eee' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                }}
              >
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '18px' }}>
                    Score: {game.score}/{game.total} ({percentage}%)
                  </p>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {new Date(game.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor:
                      game.difficulty === 'hard' ? '#f44336' :
                      game.difficulty === 'medium' ? '#FF9800' :
                      '#4CAF50',
                    color: 'white'
                  }}>
                    {game.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginTop: '30px'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Play Game
        </button>

        <button
          onClick={() => navigate('/leaderboard')}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          View Leaderboard
        </button>
      </div>
    </div>
  );
}