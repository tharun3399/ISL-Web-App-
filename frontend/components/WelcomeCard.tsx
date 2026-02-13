
import React from 'react';

interface WelcomeCardProps {
  name?: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ name = "Rahul" }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Systems Online";
    if (hour < 17) return "Core Active";
    return "Status: Operational";
  };

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-900 p-8 md:p-10 flex flex-col md:flex-row justify-between items-center shadow-xl">
      <div className="z-10 relative space-y-6 text-center md:text-left">
        <div>
          <p className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.5em] mb-2">
            {getGreeting()}
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white italic leading-tight">
            Welcome, {name}.
          </h1>
        </div>
        
        <p className="text-zinc-500 max-w-sm text-lg font-medium leading-tight">
          Your daily ISL calibration is waiting. <span className="text-white">Goal: 30m.</span>
        </p>
        
        <button className="mx-auto md:mx-0 px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest active:scale-95 shadow-lg">
          Resume Session
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </button>
      </div>

      <div className="mt-8 md:mt-0 relative scale-75 md:scale-100">
        <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full"></div>
        <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800 relative z-10 animate-pulse transition-all group-hover:text-white duration-1000">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      </div>
    </div>
  );
};

export default WelcomeCard;
