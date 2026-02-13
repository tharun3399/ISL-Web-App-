
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    navigate('/preferences');
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-900/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 border-2 border-white rounded-xl flex items-center justify-center mb-1 shadow-lg">
            <div className="w-6 h-6 bg-white rounded-sm"></div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">ISL HUB</h1>
            <p className="text-zinc-500 text-lg font-medium italic">
              {isLogin ? "Neural protocol access required." : "Initialize your silent mastery profile."}
            </p>
          </div>
        </div>

        <div className="bg-[#080808] p-8 md:p-10 rounded-[2.5rem] border border-zinc-900 space-y-8 shadow-2xl relative">
          <div className="flex bg-zinc-900/30 p-1.5 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Email Access</label>
              <input 
                type="email" 
                required
                placeholder="id@nexus.isl"
                className="w-full bg-zinc-900/20 border border-zinc-800 rounded-xl px-6 py-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Protocol Key</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900/20 border border-zinc-800 rounded-xl px-6 py-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white transition-all"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Verify Key</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/20 border border-zinc-800 rounded-xl px-6 py-4 text-white placeholder:text-zinc-800 focus:outline-none focus:border-white transition-all"
                />
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full py-5 bg-white text-black font-black text-xs rounded-xl hover:bg-zinc-200 transition-all shadow-lg active:scale-[0.98] mt-2 uppercase tracking-[0.3em]"
            >
              {isLogin ? "Authenticate" : "Initialize"}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-900"></div>
            <span className="flex-shrink mx-4 text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Alternative Sync</span>
            <div className="flex-grow border-t border-zinc-900"></div>
          </div>

          <button 
            type="button"
            onClick={() => navigate('/preferences')}
            className="w-full py-4 bg-zinc-900/20 border border-zinc-800 text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-900/40 transition-all active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-[10px] uppercase font-black tracking-widest">Google Sync</span>
          </button>
        </div>

        <p className="text-center text-[9px] font-bold text-zinc-700 uppercase tracking-widest px-12 leading-relaxed opacity-60">
          Encrypted data stream active. Privacy protocols in effect.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
