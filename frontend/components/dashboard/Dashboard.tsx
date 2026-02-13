
import React, { useState, useEffect } from 'react';
import WelcomeCard from './WelcomeCard';
import StatCard from './StatCard';
import LearningChart from './LearningChart';
import GoalCard from './GoalCard';
import AiAssistant from './AiAssistant';

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || 'User');
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-6">
        <div>
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Core System Architecture</h2>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Dashboard</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block border-r border-zinc-800 pr-6">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Active Session</p>
            <p className="text-sm font-bold text-white">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}</p>
          </div>
          <button className="px-6 py-2.5 bg-white text-black font-black hover:bg-zinc-200 active:scale-95 transition-all rounded-lg text-[10px] uppercase tracking-widest shadow-lg">
            Begin Practice
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <WelcomeCard name={userName} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard 
              label="STREAK" 
              value="12" 
              trend="Current Active Days" 
              icon={<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />}
            />
            <StatCard 
              label="EXPERIENCE" 
              value="4,820" 
              trend="Mastery Points"
              icon={<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />}
            />
          </div>

          <div className="bg-[#080808] border border-zinc-900 rounded-[2.5rem] p-8">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-lg font-black tracking-tighter text-white uppercase italic">Weekly Activity</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Focus Minutes</p>
              </div>
              <div className="px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-[9px] font-black text-zinc-400 uppercase tracking-widest">7 Day History</div>
            </div>
            <div className="h-64 md:h-72">
              <LearningChart />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <GoalCard />
          <AiAssistant />
          
          <div className="bg-zinc-900/10 border border-zinc-900/50 rounded-[2rem] p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:opacity-20 transition-all duration-500 scale-150">
               <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                 <circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4M12 16V9"/>
               </svg>
            </div>
            <h3 className="font-black text-[9px] uppercase tracking-[0.3em] mb-4 text-zinc-500">Unlocked Milestone</h3>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl grayscale group-hover:grayscale-0 transition-all">
                🏅
              </div>
              <div>
                <p className="font-black text-white text-[10px] uppercase tracking-tight">Silent Speaker</p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">2/5 modules complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
