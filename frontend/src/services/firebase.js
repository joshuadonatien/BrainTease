import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Validate that all required config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration error: Missing required environment variables");
  console.error("Current config:", {
    apiKey: firebaseConfig.apiKey ? "✓" : "✗",
    authDomain: firebaseConfig.authDomain ? "✓" : "✗",
    projectId: firebaseConfig.projectId ? "✓" : "✗",
    storageBucket: firebaseConfig.storageBucket ? "✓" : "✗",
    messagingSenderId: firebaseConfig.messagingSenderId ? "✓" : "✗",
    appId: firebaseConfig.appId ? "✓" : "✗",
  });
  throw new Error("Firebase configuration is incomplete. Please check your .env file and restart the development server.");
}

// Initialize Firebase (only if not already initialized)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized with project:", firebaseConfig.projectId);
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized");
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
