
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';

type AccountUser = {
  id: number | null;
  name: string;
  email: string;
  phone: string;
  level: string;
  joined: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<AccountUser>({
    id: null,
    name: 'ISL Learner',
    email: 'user@example.com',
    phone: '—',
    level: 'Level 1 Learner',
    joined: '—'
  });

  const applyUserProfile = (payload: Partial<AccountUser & { created_at?: string }>) => {
    setUserData(prev => ({
      ...prev,
      id: payload.id ?? prev.id,
      name: payload.name || prev.name,
      email: payload.email || prev.email,
      phone: payload.phone || prev.phone,
      joined: payload.created_at ? formatDate(payload.created_at) : (payload.joined || prev.joined),
    }));
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      if (json.success && json.data) {
        applyUserProfile(json.data);
      }
    } catch (error) {
      console.error('❌ Failed to load user details:', error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        applyUserProfile({
          id: parsed.id,
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          joined: parsed.created_at ? formatDate(parsed.created_at) : undefined,
        });
        if (parsed.id) {
          fetchUserDetails(parsed.id);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }, []);

  const initials = userData.name
    ? userData.name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0]?.toUpperCase())
        .slice(0, 2)
        .join('')
    : '??';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Logic for logout if needed
    navigate('/auth');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Settings & Profile</p>
        <h1 className="text-5xl font-extrabold tracking-tighter text-white">Account Details</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-8">
          <div className="relative group">
            <div className="w-full aspect-square bg-zinc-900 rounded-[3rem] border border-zinc-800 flex items-center justify-center text-7xl font-bold text-zinc-100 overflow-hidden">
              {initials || '??'}
            </div>
            <button className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl hover:scale-105 transition-all opacity-0 group-hover:opacity-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111] p-6 rounded-3xl border border-zinc-900">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Current Standing</p>
              <p className="text-xl font-bold text-white">{userData.level}</p>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-white h-full w-[72%]"></div>
              </div>
            </div>
            <div className="bg-[#111] p-6 rounded-3xl border border-zinc-900">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Member Since</p>
              <p className="text-xl font-bold text-white">{userData.joined}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-10">
          <section className="bg-[#111] border border-zinc-900 rounded-[2.5rem] p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Personal Information</h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 border border-zinc-800 text-zinc-400 font-bold rounded-xl hover:border-white hover:text-white transition-all text-xs uppercase tracking-widest"
                >
                  Edit Details
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Full Name</label>
                  <input 
                    type="text" 
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Email Address</label>
                  <input 
                    type="email" 
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Phone</label>
                  <input 
                    type="tel" 
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white transition-all"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-white text-black font-extrabold rounded-2xl hover:bg-zinc-200 transition-all"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 bg-zinc-900 text-white font-extrabold rounded-2xl hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-xl font-bold">{userData.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-xl font-bold">{userData.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-xl font-bold">{userData.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Member Since</p>
                  <p className="text-xl font-bold">{userData.joined}</p>
                </div>
              </div>
            )}
          </section>

          <section className="bg-[#111] border border-zinc-900 rounded-[2.5rem] p-10 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">Danger Zone</h2>
            <p className="text-zinc-500 text-sm">Once you sign out, you will need to authenticate again to access your dashboard.</p>
            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-zinc-900 border border-zinc-800 text-red-500 font-extrabold rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sign Out from ISL HUB
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
