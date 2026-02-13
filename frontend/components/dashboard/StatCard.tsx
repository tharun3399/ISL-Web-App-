
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon }) => {
  return (
    <div className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col justify-between hover:bg-zinc-900/20 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white border border-zinc-800 group-hover:border-zinc-600 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {icon}
          </svg>
        </div>
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">{label}</span>
      </div>
      <div>
        <p className="text-4xl md:text-5xl font-black tracking-tighter mb-1 text-white">{value}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_5px_white]"></div>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{trend}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
