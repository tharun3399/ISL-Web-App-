
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Google login response
  const handleGoogleResponse = async (codeResponse: any) => {
    try {
      setError('');
      setLoading(true);

      // Send authorization code to backend for token exchange
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeResponse.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Google authentication failed');
        setLoading(false);
        return;
      }

      // Store token and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));

      console.log('✅ Google login successful:', data.data);
      
      // Redirect to dashboard or preferences based on new user
      if (data.isNewUser) {
        navigate('/preferences');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('❌ Google auth error:', err);
      setError(err.message || 'Google authentication failed');
      setLoading(false);
    }
  };

  // Initialize Google login hook
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleResponse,
    onError: () => setError('Google sign-in was cancelled or failed'),
    flow: 'auth-code',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login request
        if (!email || !password) {
          setError('Email and password are required');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Login failed');
          setLoading(false);
          return;
        }

        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));

        console.log('✅ Login successful:', data.data);
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Signup request
        if (!name || !email || !phone || !password || !confirmPassword) {
          setError('All fields are required');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
            confirmPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Signup failed');
          setLoading(false);
          return;
        }

        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));

        console.log('✅ Signup successful:', data.data);
        // Redirect to preferences
        navigate('/preferences');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const toggleAuthMode = (mode: boolean) => {
    setIsLogin(mode);
    setError('');
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-900/10 blur-[150px] rounded-full pointer-events-none"></div>

        {/* Reduced max-width from max-w-lg/max-md to max-w-sm for a narrower, more elegant profile */}
        <div className="w-full max-w-sm z-10 space-y-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-10 h-10 border-2 border-white rounded-lg flex items-center justify-center mb-1 shadow-lg">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">ISL HUB</h1>
            <p className="text-zinc-500 text-sm font-medium italic">
              {isLogin ? "Neural protocol access required." : "Initialize mastery profile."}
            </p>
          </div>
        </div>

        <div className="bg-[#080808] p-6 md:p-8 rounded-[2rem] border border-zinc-900 space-y-6 shadow-2xl relative">
          <div className="flex bg-zinc-900/30 p-1 rounded-lg border border-zinc-800">
            <button 
              onClick={() => toggleAuthMode(true)}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${isLogin ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => toggleAuthMode(false)}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${!isLogin ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Create
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm animate-in slide-in-from-top-2">
                <p className="font-semibold">❌ {error}</p>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Full Name</label>
                  <input 
                    type="text" 
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={loading}
                    className="w-full bg-zinc-900/20 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white transition-all text-sm disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required={!isLogin}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    disabled={loading}
                    className="w-full bg-zinc-900/20 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white transition-all text-sm disabled:opacity-50"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-1">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Email Access</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="id@nexus.isl"
                disabled={loading}
                className="w-full bg-zinc-900/20 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white transition-all text-sm disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Protocol Key</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-zinc-900/20 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white transition-all text-sm disabled:opacity-50"
              />
            </div>

            {!isLogin && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">Verify Key</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full bg-zinc-900/20 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white transition-all text-sm disabled:opacity-50"
                />
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-black text-[10px] rounded-lg hover:bg-zinc-200 transition-all shadow-lg active:scale-[0.98] mt-2 uppercase tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Processing...' : (isLogin ? "Authenticate" : "Initialize")}
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-zinc-900"></div>
            <span className="flex-shrink mx-3 text-[7px] font-black text-zinc-700 uppercase tracking-[0.4em]">Alternative</span>
            <div className="flex-grow border-t border-zinc-900"></div>
          </div>

          <button 
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full py-2.5 bg-zinc-900/20 border border-zinc-800 text-white font-bold rounded-lg flex items-center justify-center gap-3 hover:bg-zinc-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-[9px] uppercase font-black tracking-widest">Google Sync</span>
          </button>
        </div>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
};

export default AuthPage;
