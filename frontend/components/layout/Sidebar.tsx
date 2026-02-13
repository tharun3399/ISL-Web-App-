
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('John Doe');
  const [userLevel, setUserLevel] = useState('LEVEL 4');
  const [userInitials, setUserInitials] = useState('JD');

  const menuItems = [
    { id: 'dashboard', label: 'Overview', path: '/dashboard' },
    { id: 'lessons', label: 'Lessons', path: '/lessons' },
    { id: 'practice', label: 'Practice', path: '/practice' },
    { id: 'dictionary', label: 'Dictionary', path: '/dictionary' },
  ];

  const activeTab = menuItems.find(item => location.pathname === item.path)?.id || 
                    (location.pathname === '/account' ? 'account' : '');

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

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
    <aside className={`
      fixed inset-y-0 left-0 z-[55] w-64 bg-[#050505] border-r border-zinc-900 p-6 h-full shrink-0 flex flex-col transition-transform duration-500 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isOpen ? 'shadow-[20px_0_60px_rgba(0,0,0,0.8)]' : ''}
    `}>
      
      {/* Branding / Logo Area with Integrated Toggle */}
      <div className="mb-12 mt-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => handleNavigation('/dashboard')}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-4 h-4 bg-black rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">ISL HUB</h1>
        </div>

        {/* Integrated Toggle Button next to heading */}
        <button 
          onClick={onClose}
          className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-all active:scale-90"
          title="Collapse Sidebar"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      
      <nav className="space-y-3 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`w-full text-left px-4 py-3.5 text-[10px] font-bold rounded-xl transition-all duration-300 uppercase tracking-[0.15em] ${
              activeTab === item.id 
                ? 'bg-white text-black shadow-lg' 
                : 'text-zinc-600 hover:text-white hover:bg-zinc-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div 
        className={`mt-12 p-4 rounded-[1.5rem] cursor-pointer transition-all border ${
          activeTab === 'account' 
            ? 'bg-white text-black border-white shadow-xl' 
            : 'bg-zinc-900/40 text-white border-zinc-900 hover:bg-zinc-900'
        }`}
        onClick={() => handleNavigation('/account')}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border text-[10px] shrink-0 ${
            activeTab === 'account' ? 'bg-black text-white border-zinc-700' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
          }`}>
            {userInitials}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-xs truncate">{userName}</p>
            <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${activeTab === 'account' ? 'text-zinc-500' : 'text-zinc-600'}`}>{userLevel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
