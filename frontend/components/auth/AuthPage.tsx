
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError('');
      setLoading(true);

      // Send Google credential to backend for verification
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
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

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed');
  };

  return (
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

          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
                theme="dark"
                size="large"
                width="100%"
              />
            </div>
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
