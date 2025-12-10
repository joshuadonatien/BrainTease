import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDdkjIFtPJq-otsRarOPb9AIe0IifhRTLU",
  authDomain: "braintease-a0119.firebaseapp.com",
  projectId: "braintease-a0119",
  storageBucket: "braintease-a0119.firebasestorage.app",
  messagingSenderId: "593199780264",
  appId: "1:593199780264:web:bf726c2b5cc36a17c28d9d",
  measurementId: "G-JVYCFJCZMK"
};

// Initialize Firebase
let app;
let auth;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Optional: Configure Google Provider
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create mock auth for development if Firebase is not configured
  auth = null;
  googleProvider = null;
}

export { auth, googleProvider };
export default app;