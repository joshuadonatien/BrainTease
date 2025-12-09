// import { signInWithPopup } from "firebase/auth";
// import { auth, provider } from "../firebase";

// function Login() {
//   const login = async () => {
//     const result = await signInWithPopup(auth, provider);
//     console.log("Logged in:", result.user);
//   };

//   return <button onClick={login}>Sign in with Google</button>;
// }

// export default Login;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up logic
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // TODO: Replace with actual Firebase sign up
        // const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        // await updateProfile(userCredential.user, { displayName: formData.username });
        
        console.log('Sign up with:', formData);
        
        // Mock: Save user to localStorage for now
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          username: formData.username,
          uid: 'mock-' + Date.now()
        }));
        
        navigate('/profile');
      } else {
        // Login logic
        // TODO: Replace with actual Firebase login
        // const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        
        console.log('Login with:', formData.email);
        
        // Mock: Save user to localStorage for now
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          username: formData.email.split('@')[0],
          uid: 'mock-' + Date.now()
        }));
        
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    // TODO: Replace with actual Firebase Google Sign In
    // const provider = new GoogleAuthProvider();
    // const result = await signInWithPopup(auth, provider);
    
    console.log('Google Sign In');
    setError('Google Sign In - Connect to Firebase');
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#2196F3' }}>
            🎯 Trivia Game
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your username"
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          {isSignUp && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: loading ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '500',
            backgroundColor: 'white',
            color: '#333',
            border: '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px'
          }}
        >
          <span style={{ fontSize: '20px' }}>🔍</span>
          Continue with Google
        </button>

        {/* Toggle Sign Up / Login */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#2196F3',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            {isSignUp 
              ? 'Already have an account? Login' 
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Guest Mode */}
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}