import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GuestNotification({ message = "Sign in to save your progress and compete on leaderboards!" }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Don't show if user is already authenticated
  if (currentUser) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #5b9491, #4a7a77)',
      color: 'white',
      padding: '12px 20px',
      margin: '10px 0',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>👤</span>
        <span style={{ fontSize: '14px' }}>{message}</span>
      </div>
      
      <button
        onClick={() => navigate('/login')}
        style={{
          background: 'white',
          color: '#5b9491',
          border: 'none',
          padding: '6px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        Sign In
      </button>
    </div>
  );
}