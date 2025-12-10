# BrainTease Full-Stack Setup Guide

## 🚀 Complete Django-Firebase-Frontend Integration

### 1. Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Enter project name (e.g., "braintease-app")
   - Enable Google Analytics (optional)

2. **Enable Authentication**:
   - In Firebase console, go to "Authentication" > "Sign-in method"
   - Enable "Email/Password" provider
   - Enable "Google" provider
   - Add your domain to authorized domains

3. **Get Firebase Configuration**:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Web app" icon to create a web app
   - Register app with name "BrainTease Frontend"
   - Copy the configuration object

### 2. Environment Configuration

1. **Frontend Environment**:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Add your Firebase config to `.env`**:
   ```
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_API_URL=http://localhost:8000/api
   ```

### 3. Django Backend Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements-pip.txt
   ```

2. **Firebase Admin SDK**:
   - In Firebase console, go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Save it as `firebase-service-account.json` in the `backend` folder
   - Add to `.gitignore`: `firebase-service-account.json`

3. **Django Settings**:
   - The Firebase integration is already configured in `api/firebase_auth.py`
   - CORS is configured for `localhost:3000`

4. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Start Django Server**:
   ```bash
   python manage.py runserver
   ```

### 4. Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start React App**:
   ```bash
   npm start
   ```

### 5. Authentication Flow

✅ **What's Already Implemented**:

- **Firebase Authentication Context** (`src/context/AuthContext.js`)
  - Email/password sign up and sign in
  - Google sign-in
  - User state management
  - Automatic login/logout handling

- **Login Component** (`src/pages/Login.jsx`)
  - Toggle between sign-in and sign-up modes
  - Form validation and error handling
  - Google sign-in button
  - Automatic redirect after login

- **Protected Routes** (`src/components/ProtectedRoute.jsx`)
  - Redirects unauthenticated users to login
  - Protects game and difficulty selection pages

- **API Service** (`src/services/api.js`)
  - Centralized backend communication
  - Automatic Firebase token attachment
  - Comprehensive game and user endpoints

### 6. Testing the Integration

1. **Start both servers**:
   - Django: `python manage.py runserver` (port 8000)
   - React: `npm start` (port 3000)

2. **Test Authentication**:
   - Visit `http://localhost:3000`
   - Click "Login" in navbar
   - Try creating a new account
   - Try signing in with existing account
   - Try Google sign-in

3. **Test Protected Routes**:
   - Try accessing `/game` or `/difficulty` without logging in
   - Should redirect to login page
   - After login, should access protected pages

### 7. Current Architecture

```
Frontend (React)           Backend (Django)           Firebase
     |                           |                        |
   Login ──────────────────> API Endpoints <────── Auth Service
     |                           |                        |
AuthContext ────────────> User Management <────── Admin SDK
     |                           |                        |
Protected Routes ──────> Game/Question APIs              |
     |                           |                        |
API Service ────────────> Data Storage               User Auth
```

### 8. Next Steps

- [ ] Add user profile management
- [ ] Implement game scoring integration
- [ ] Add real-time leaderboard updates
- [ ] Set up production environment variables
- [ ] Deploy to hosting platforms

### 🔧 Troubleshooting

**Firebase Errors**:
- Ensure all environment variables are set correctly
- Check Firebase project configuration
- Verify authentication providers are enabled

**CORS Errors**:
- Django backend includes CORS headers for localhost:3000
- If running on different ports, update Django settings

**Authentication Issues**:
- Check browser console for Firebase errors
- Verify Firebase configuration matches project settings
- Ensure service account key is properly configured

### 🎮 Ready to Play!

Your BrainTease app now has complete authentication integration between:
- React frontend with Firebase auth
- Django backend with Firebase admin verification
- Protected game routes and user management

The authentication flow is fully functional and ready for testing!