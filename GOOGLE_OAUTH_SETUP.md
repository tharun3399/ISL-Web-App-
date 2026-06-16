# Google OAuth Implementation Guide

## ✅ What's Been Implemented

### Frontend Changes
- Added `@react-oauth/google` library to package.json
- Updated [AuthPage.tsx](frontend/components/auth/AuthPage.tsx) with:
  - `GoogleLogin` component from `@react-oauth/google`
  - `handleGoogleSuccess()` function to process Google credentials
  - `handleGoogleError()` function to handle authentication failures
  - Automatic redirect to `/preferences` for new users or `/dashboard` for existing users

### Backend Changes
- Added `google-auth-library` package to package.json
- Updated [backend/src/routes/auth.ts](backend/src/routes/auth.ts) with:
  - `POST /api/auth/google` endpoint
  - Google ID token verification using `OAuth2Client`
  - Automatic user creation if Google email doesn't exist
  - JWT token generation for authenticated users
  - Return `isNewUser` flag to differentiate first-time signups

### Environment Variables
- Created `.env.example` with documentation
- Updated `.env` files in both frontend and backend with `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` placeholders

---

## 🚀 Next Steps to Complete Setup

### 1. Create Google OAuth 2.0 Credentials

**Go to Google Cloud Console:**
1. Visit https://console.cloud.google.com/
2. Create a new project (if needed)
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Select **Web Application**
6. Add these **Authorized JavaScript Origins:**
   - `http://localhost:3000` (for local development)
   - `http://localhost:5173` (for Vite dev server)
   - `https://isl-web-app.vercel.app` (for production)
7. Copy the **Client ID** (you'll need this for both frontend and backend)

### 2. Update Environment Variables

**Frontend (.env):**
```dotenv
VITE_API_BASE_URL=https://isl-web-app-2-uxja.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

**Backend (.env):**
```dotenv
GOOGLE_CLIENT_ID=your_client_id_here
# ... other variables remain the same
```

### 3. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 4. Deploy to Production

**Frontend (Vercel):**
- Add `VITE_GOOGLE_CLIENT_ID` environment variable in Vercel dashboard
- Redeploy

**Backend (Render):**
- Add `GOOGLE_CLIENT_ID` environment variable in Render dashboard
- Redeploy

---

## 🔐 How It Works

### User Flow (Initial Sign-In with Google):
1. User clicks "Sign in with Google" button
2. Google popup appears for authentication
3. User grants permission to ISL HUB
4. Frontend receives `credential` (JWT token from Google)
5. Frontend sends credential to `POST /api/auth/google`
6. Backend verifies token with Google's servers
7. Backend creates new user if email doesn't exist
8. Backend returns JWT token and user data
9. Frontend stores token + user in localStorage
10. Frontend redirects to `/preferences` (new user) or `/dashboard` (existing user)

### User Flow (Returning User):
1-7. Same as above
8. Backend finds existing user by email
9. Backend returns JWT token and user data
10. Frontend stores token + user in localStorage
11. Frontend redirects to `/dashboard`

---

## 📋 Files Modified

- ✅ `frontend/package.json` - Added `@react-oauth/google`
- ✅ `frontend/components/auth/AuthPage.tsx` - Added GoogleLogin component and handlers
- ✅ `frontend/.env` - Added `VITE_GOOGLE_CLIENT_ID`
- ✅ `frontend/.env.example` - Added documentation
- ✅ `backend/package.json` - Added `google-auth-library`
- ✅ `backend/src/routes/auth.ts` - Added `/google` endpoint
- ✅ `backend/.env` - Added `GOOGLE_CLIENT_ID`

---

## 🧪 Local Testing

1. Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` to your Google Client ID
2. Set `GOOGLE_CLIENT_ID` in `backend/.env` to your Google Client ID
3. Run frontend: `npm run dev` (http://localhost:3000)
4. Run backend: `npm run start` (should be running)
5. Go to auth page and click "Sign in with Google"
6. You should be redirected to dashboard or preferences

---

## 🔗 Reference Architecture

```
Google Sign-In Button (Frontend)
          ↓
GoogleLogin Component (@react-oauth/google)
          ↓
handleGoogleSuccess() - sends credential JWT to backend
          ↓
POST /api/auth/google (Backend)
          ↓
OAuth2Client.verifyIdToken() - validates with Google
          ↓
Extract email/name from payload
          ↓
UserModel.findByEmail() - check if user exists
          ↓
Create or retrieve user
          ↓
generateToken() - create JWT for frontend
          ↓
Return { token, user, isNewUser } to frontend
          ↓
localStorage.setItem() - save token and user
          ↓
Navigate to /dashboard or /preferences
```

---

## ⚠️ Important Notes

- **Google Client ID is required** for both frontend and backend
- Google OAuth automatically creates users on first sign-in
- Users signed in with Google don't have passwords set (phone is empty)
- Both email/password and Google OAuth use the same JWT system
- Users can't mix authentication methods (one email can't have both password and Google OAuth - first method used)
- After deploying to Vercel and Render, remember to add the authorized origins to Google Cloud Console

---

Commit: `e5ce77e` - Google OAuth integration pushed successfully ✅
