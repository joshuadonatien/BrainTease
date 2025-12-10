// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     username: "",
//     confirmPassword: "",
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   function handleChange(e) {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       let endpoint = isSignUp
//         ? "/api/auth/signup/"
//         : "/api/auth/login/";

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         throw new Error("Authentication failed");
//       }

//       const data = await response.json();

//       // Save token + user
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       navigate("/profile");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleGoogleSignIn() {
//     // TODO: Replace with actual Firebase Google Sign In
//     // const provider = new GoogleAuthProvider();
//     // const result = await signInWithPopup(auth, provider);
    
//     console.log('Google Sign In');
//     setError('Google Sign In - Connect to Firebase');
//   }

//   return (
//     <div style={{
//       minHeight: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#f5f5f5',
//       padding: '20px'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '40px',
//         borderRadius: '12px',
//         boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//         maxWidth: '400px',
//         width: '100%'
//       }}>
//         {/* Header */}
//         <div style={{ textAlign: 'center', marginBottom: '30px' }}>
//           <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#2196F3' }}>
//             🎯 Trivia Game
//           </h1>
//           <p style={{ color: '#666', fontSize: '16px' }}>
//             {isSignUp ? 'Create your account' : 'Welcome back!'}
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div style={{
//             padding: '12px',
//             backgroundColor: '#ffebee',
//             color: '#c62828',
//             borderRadius: '8px',
//             marginBottom: '20px',
//             fontSize: '14px'
//           }}>
//             {error}
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit}>
//           {isSignUp && (
//             <div style={{ marginBottom: '20px' }}>
//               <label style={{ 
//                 display: 'block', 
//                 marginBottom: '8px', 
//                 fontWeight: '500',
//                 fontSize: '14px'
//               }}>
//                 Username
//               </label>
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   fontSize: '16px',
//                   border: '2px solid #ddd',
//                   borderRadius: '8px',
//                   boxSizing: 'border-box'
//                 }}
//                 placeholder="Enter your username"
//               />
//             </div>
//           )}

//           <div style={{ marginBottom: '20px' }}>
//             <label style={{ 
//               display: 'block', 
//               marginBottom: '8px', 
//               fontWeight: '500',
//               fontSize: '14px'
//             }}>
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               style={{
//                 width: '100%',
//                 padding: '12px',
//                 fontSize: '16px',
//                 border: '2px solid #ddd',
//                 borderRadius: '8px',
//                 boxSizing: 'border-box'
//               }}
//               placeholder="Enter your email"
//             />
//           </div>

//           <div style={{ marginBottom: '20px' }}>
//             <label style={{ 
//               display: 'block', 
//               marginBottom: '8px', 
//               fontWeight: '500',
//               fontSize: '14px'
//             }}>
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               style={{
//                 width: '100%',
//                 padding: '12px',
//                 fontSize: '16px',
//                 border: '2px solid #ddd',
//                 borderRadius: '8px',
//                 boxSizing: 'border-box'
//               }}
//               placeholder="Enter your password"
//             />
//           </div>

//           {isSignUp && (
//             <div style={{ marginBottom: '20px' }}>
//               <label style={{ 
//                 display: 'block', 
//                 marginBottom: '8px', 
//                 fontWeight: '500',
//                 fontSize: '14px'
//               }}>
//                 Confirm Password
//               </label>
//               <input
//                 type="password"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   fontSize: '16px',
//                   border: '2px solid #ddd',
//                   borderRadius: '8px',
//                   boxSizing: 'border-box'
//                 }}
//                 placeholder="Confirm your password"
//               />
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               width: '100%',
//               padding: '14px',
//               fontSize: '16px',
//               fontWeight: 'bold',
//               backgroundColor: loading ? '#ccc' : '#2196F3',
//               color: 'white',
//               border: 'none',
//               borderRadius: '8px',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               marginBottom: '15px'
//             }}
//           >
//             {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
//           </button>
//         </form>

//         {/* Google Sign In */}
//         <button
//           onClick={handleGoogleSignIn}
//           style={{
//             width: '100%',
//             padding: '12px',
//             fontSize: '16px',
//             fontWeight: '500',
//             backgroundColor: 'white',
//             color: '#333',
//             border: '2px solid #ddd',
//             borderRadius: '8px',
//             cursor: 'pointer',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '10px',
//             marginBottom: '20px'
//           }}
//         >
//           <span style={{ fontSize: '20px' }}>🔍</span>
//           Continue with Google
//         </button>

//         {/* Toggle Sign Up / Login */}
//         <div style={{ textAlign: 'center', marginTop: '20px' }}>
//           <button
//             onClick={() => {
//               setIsSignUp(!isSignUp);
//               setError('');
//             }}
//             style={{
//               background: 'none',
//               border: 'none',
//               color: '#2196F3',
//               cursor: 'pointer',
//               fontSize: '14px',
//               textDecoration: 'underline'
//             }}
//           >
//             {isSignUp 
//               ? 'Already have an account? Login' 
//               : "Don't have an account? Sign Up"}
//           </button>
//         </div>

//         {/* Guest Mode */}
//         <div style={{ textAlign: 'center', marginTop: '15px' }}>
//           <button
//             onClick={() => navigate('/')}
//             style={{
//               background: 'none',
//               border: 'none',
//               color: '#666',
//               cursor: 'pointer',
//               fontSize: '14px'
//             }}
//           >
//             Continue as Guest
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const { login, signup, loginWithGoogle } = useAuth();

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
        // Sign Up validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        // Create account with Firebase
        await signup(formData.email, formData.password, formData.username);
        console.log('Sign up successful');
        navigate('/profile');
      } else {
        // Login with Firebase
        await login(formData.email, formData.password);
        console.log('Login successful');
        navigate('/profile');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      
      // User-friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      console.log('Google sign in successful');
      navigate('/profile');
    } catch (err) {
      console.error('Google sign in error:', err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please enable popups for this site.');
      } else {
        setError('Google sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
            🧠 BrainTease
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
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '500',
            backgroundColor: 'white',
            color: '#333',
            border: '2px solid #ddd',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
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
              setFormData({
                email: '',
                password: '',
                username: '',
                confirmPassword: ''
              });
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