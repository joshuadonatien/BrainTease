import { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext({});

// export function useAuth() {
//   return useContext(AuthContext);
// }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Sign in error:", error);
      // Provide more helpful error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error("No account found with this email. Please sign up first.");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email address.");
      } else if (error.code === 'auth/user-disabled') {
        throw new Error("This account has been disabled.");
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error("Email/Password authentication is not enabled. Please enable it in Firebase Console.");
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error("Network error. Please check your connection.");
      }
      throw error;
    }
  };

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error("Sign up error:", error);
      // Provide more helpful error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("An account with this email already exists. Please sign in instead.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email address.");
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error("Email/Password authentication is not enabled. Please enable it in Firebase Console under Authentication → Sign-in method.");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("Password is too weak. Please use at least 6 characters.");
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error("Network error. Please check your connection.");
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    return await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
