
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserPreferences: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    goal: '30m',
    level: 'Beginner',
    reason: 'Personal'
  });

  const goals = [
    { id: '15m', label: '15 MIN', desc: 'LIGHT', sub: 'Baseline maintenance' },
    { id: '30m', label: '30 MIN', desc: 'STANDARD', sub: 'Core daily rhythm' },
    { id: '60m', label: '60 MIN', desc: 'INTENSE', sub: 'Rapid neural growth' },
  ];

  const levels = [
    { id: 'Beginner', label: 'L01', desc: 'ZERO', sub: 'Starting from scratch' },
    { id: 'Basic', label: 'L02', desc: 'BASIC', sub: 'Know alphabet/numbers' },
    { id: 'Intermediate', label: 'L03', desc: 'ACTIVE', sub: 'Some conversation ready' },
  ];

  const reasons = [
    { id: 'Personal', label: 'GROWTH', icon: '🌱', sub: 'Self-improvement' },
    { id: 'Professional', label: 'WORK', icon: '💼', sub: 'Career advancement' },
    { id: 'Social', label: 'SOCIAL', icon: '🤝', sub: 'Community focus' },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[200px]"></div>
      </div>

      <div className="absolute top-12 w-full text-center z-0 opacity-[0.01] pointer-events-none select-none">
        <h1 className="text-[20vw] font-black italic tracking-tighter uppercase leading-none">SYNC</h1>
      </div>

      <div className="w-full max-w-5xl z-10 space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="text-center space-y-4">
          <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[1.2em]">PHASE 0{step} / 03</p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
            {step === 1 && "Daily Objective"}
            {step === 2 && "Skill Calibrator"}
            {step === 3 && "Core Catalyst"}
          </h2>
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-snug">
            {step === 1 && "Set the temporal commitment for your ISL journey."}
            {step === 2 && "Determine your current coordinates in the sign spectrum."}
            {step === 3 && "Identify the primary motivation for your evolution."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(step === 1 ? goals : step === 2 ? levels : reasons).map((item: any) => (
            <button
              key={item.id}
              onClick={() => {
                if (step === 1) setPreferences({ ...preferences, goal: item.id });
                if (step === 2) setPreferences({ ...preferences, level: item.id });
                if (step === 3) setPreferences({ ...preferences, reason: item.id });
              }}
              className={`p-8 rounded-[2rem] border text-left transition-all duration-500 relative flex flex-col justify-between min-h-[180px] md:min-h-[220px] ${
                (step === 1 ? preferences.goal : step === 2 ? preferences.level : preferences.reason) === item.id 
                  ? 'bg-white text-black border-white scale-105 shadow-2xl shadow-white/10' 
                  : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'
              }`}
            >
              <div>
                {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
                <h3 className="text-3xl font-black tracking-tighter uppercase mb-1 leading-none">{item.label}</h3>
                <p className={`text-[9px] font-black uppercase tracking-widest ${
                  (step === 1 ? preferences.goal : step === 2 ? preferences.level : preferences.reason) === item.id 
                    ? 'text-zinc-500' : 'text-zinc-600'
                }`}>
                  {item.desc || 'Protocol'}
                </p>
              </div>
              <p className={`text-[11px] font-bold uppercase tracking-tight mt-auto ${
                (step === 1 ? preferences.goal : step === 2 ? preferences.level : preferences.reason) === item.id 
                  ? 'text-zinc-400' : 'text-zinc-700'
              }`}>
                {item.sub}
              </p>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center pt-8 gap-8">
           <button 
             onClick={handleNext}
             className="px-20 py-5 bg-white text-black font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-zinc-200 transition-all text-xs shadow-xl active:scale-95"
           >
             {step === 3 ? "Complete Sync" : "Next Phase"}
           </button>
           
           <div className="flex gap-4">
              {[1,2,3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${i === step ? 'w-16 bg-white shadow-[0_0_10px_white]' : 'w-4 bg-zinc-900'}`} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
