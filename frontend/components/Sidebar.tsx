
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('John Doe');
  const [userInitials, setUserInitials] = useState('JD');
  const [userLevel, setUserLevel] = useState('LEVEL 4');

  const menuItems = [
    { id: 'dashboard', label: 'Overview', path: '/dashboard' },
    { id: 'lessons', label: 'Lessons', path: '/lessons' },
    { id: 'practice', label: 'Practice', path: '/practice' },
    { id: 'dictionary', label: 'Dictionary', path: '/dictionary' },
    { id: 'settings', label: 'Settings', path: '/settings' },
  ];

  const activeTab = menuItems.find(item => location.pathname === item.path)?.id || 
                    (location.pathname === '/account' ? 'account' : '');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    try {
      const parsed = JSON.parse(storedUser);
      const name = parsed.name || 'ISL Learner';
      setUserName(name);
      const initials = name
        .split(' ')
        .filter(Boolean)
        .map((part: string) => part[0]?.toUpperCase())
        .slice(0, 2)
        .join('');
      setUserInitials(initials || '??');
      if (parsed.level) {
        setUserLevel(parsed.level.toUpperCase());
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
    }
  }, []);

  return (
    <aside className="w-80 border-r border-zinc-900 hidden lg:flex flex-col p-10 h-full bg-[#050505] shrink-0">
      <div className="mb-20 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 bg-black rounded-sm"></div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">ISL HUB</h1>
      </div>
      
      <nav className="space-y-4 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full text-left px-6 py-4 text-sm font-semibold rounded-2xl transition-all duration-200 uppercase tracking-[0.2em] ${
              activeTab === item.id 
                ? 'bg-white text-black shadow-2xl shadow-white/5' 
                : 'text-zinc-600 hover:text-white hover:bg-zinc-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div 
        className={`mt-20 p-6 rounded-[2rem] cursor-pointer transition-all border ${
          activeTab === 'account' 
            ? 'bg-white text-black border-white' 
            : 'bg-zinc-900/40 text-white border-zinc-900 hover:bg-zinc-900'
        }`}
        onClick={() => navigate('/account')}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border text-sm ${
            activeTab === 'account' ? 'bg-black text-white border-zinc-700' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
          }`}>
            {userInitials}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{userName}</p>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${activeTab === 'account' ? 'text-zinc-500' : 'text-zinc-600'}`}>{userLevel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;