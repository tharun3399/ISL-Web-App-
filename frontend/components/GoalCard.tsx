
import React from 'react';

const GoalCard: React.FC = () => {
  return (
    <div className="bg-[#0a0a0a] rounded-[3rem] p-10 space-y-10 border border-zinc-900 shadow-xl">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black tracking-tighter uppercase italic">Objective</h3>
        <span className="text-[9px] bg-white text-black px-4 py-1.5 rounded-full font-black uppercase tracking-widest">Phase 04</span>
      </div>
      
      <div className="space-y-8">
        <div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Current Vector</p>
          <p className="text-3xl font-black tracking-tight leading-none text-white uppercase">Conversational Fluency</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <span>Progress Index</span>
            <span className="text-white">72%</span>
          </div>
          <div className="w-full bg-zinc-900/50 h-5 rounded-full overflow-hidden border border-zinc-900 p-1">
            <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: '72%' }}></div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse"></div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Deadline: 30 Oct</p>
          </div>
          <button className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white pb-1 hover:text-zinc-400 hover:border-zinc-400 transition-all">
            Recalibrate
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
