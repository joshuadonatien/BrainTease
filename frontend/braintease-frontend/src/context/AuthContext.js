import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up with email and password
  async function signup(email, password, username) {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (username) {
        await updateProfile(userCredential.user, {
          displayName: username
        });
      }
      
      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Login with email and password
  async function login(email, password) {
    try {
      setError(null);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Login with Google
  async function loginWithGoogle() {
    try {
      setError(null);
      if (!googleProvider) {
        throw new Error('Google provider not initialized');
      }
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Logout
  async function logout() {
    try {
      setError(null);
      return await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    try {
      setError(null);
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      await updateProfile(currentUser, updates);
      // Force refresh the user object
      setCurrentUser({ ...currentUser, ...updates });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Get current auth token
  async function getAuthToken() {
    try {
      if (!currentUser) {
        return null;
      }
      return await currentUser.getIdToken();
    } catch (err) {
      console.error('Error getting auth token:', err);
      return null;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        console.log('User logged in:', user.email);
      } else {
        console.log('User logged out');
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    getAuthToken,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}