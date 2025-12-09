import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, easy, medium, hard
  const navigate = useNavigate();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  function loadLeaderboard() {
    // For now, using mock data from localStorage
    // Later we'll connect this to Django backend
    const savedScores = localStorage.getItem('triviaScores');
    
    if (savedScores) {
      const scores = JSON.parse(savedScores);
      setLeaderboardData(scores);
    } else {
      // Mock data for demonstration
      setLeaderboardData([
        { id: 1, playerName: 'Player1', score: 10, total: 10, difficulty: 'hard', date: '2024-12-09' },
        { id: 2, playerName: 'Player2', score: 9, total: 10, difficulty: 'hard', date: '2024-12-09' },
        { id: 3, playerName: 'Player3', score: 10, total: 10, difficulty: 'medium', date: '2024-12-08' },
        { id: 4, playerName: 'Player4', score: 8, total: 10, difficulty: 'medium', date: '2024-12-08' },
        { id: 5, playerName: 'Player5', score: 10, total: 10, difficulty: 'easy', date: '2024-12-07' },
      ]);
    }
    
    setLoading(false);
  }

  function getFilteredData() {
    if (filter === 'all') {
      return leaderboardData;
    }
    return leaderboardData.filter(entry => entry.difficulty === filter);
  }

  function sortedData() {
    const filtered = getFilteredData();
    // Sort by score (descending), then by date (most recent first)
    return filtered.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.date) - new Date(a.date);
    });
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading leaderboard...</div>;
  }

  const displayData = sortedData();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#2196F3' }}>
          🏆 Leaderboard
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Top scores from our trivia champions
        </p>
      </div>

      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {['all', 'easy', 'medium', 'hard'].map(difficulty => (
          <button
            key={difficulty}
            onClick={() => setFilter(difficulty)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              border: filter === difficulty ? '2px solid #2196F3' : '2px solid #ddd',
              backgroundColor: filter === difficulty ? '#2196F3' : '#fff',
              color: filter === difficulty ? 'white' : '#333',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: filter === difficulty ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      {displayData.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f5f5f5',
          borderRadius: '12px'
        }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            No scores yet for this difficulty. Be the first! 🎯
          </p>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Table Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '60px 1fr 120px 120px 150px',
            padding: '15px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <div>Rank</div>
            <div>Player</div>
            <div>Score</div>
            <div>Difficulty</div>
            <div>Date</div>
          </div>

          {/* Table Rows */}
          {displayData.map((entry, index) => {
            const percentage = Math.round((entry.score / entry.total) * 100);
            let rankIcon = '';
            let rankColor = '#333';
            
            if (index === 0) {
              rankIcon = '🥇';
              rankColor = '#FFD700';
            } else if (index === 1) {
              rankIcon = '🥈';
              rankColor = '#C0C0C0';
            } else if (index === 2) {
              rankIcon = '🥉';
              rankColor = '#CD7F32';
            }

            return (
              <div 
                key={entry.id}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '60px 1fr 120px 120px 150px',
                  padding: '15px 20px',
                  borderBottom: index < displayData.length - 1 ? '1px solid #eee' : 'none',
                  backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
                  alignItems: 'center'
                }}
              >
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '18px',
                  color: rankColor
                }}>
                  {rankIcon} {index + 1}
                </div>
                <div style={{ fontWeight: '500', fontSize: '16px' }}>
                  {entry.playerName}
                </div>
                <div style={{ fontWeight: 'bold', color: '#2196F3' }}>
                  {entry.score}/{entry.total} ({percentage}%)
                </div>
                <div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: 
                      entry.difficulty === 'hard' ? '#f44336' :
                      entry.difficulty === 'medium' ? '#FF9800' :
                      '#4CAF50',
                    color: 'white'
                  }}>
                    {entry.difficulty.toUpperCase()}
                  </span>
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  {new Date(entry.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
          onClick={loadLeaderboard}
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
          Refresh
        </button>
      </div>
    </div>
  );
}