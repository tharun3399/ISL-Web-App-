
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
    { id: '15m', label: '15 MIN', desc: 'LIGHT', sub: 'Baseline' },
    { id: '30m', label: '30 MIN', desc: 'STANDARD', sub: 'Core rhythm' },
    { id: '60m', label: '60 MIN', desc: 'INTENSE', sub: 'Rapid growth' },
  ];

  const levels = [
    { id: 'Beginner', label: 'L01', desc: 'ZERO', sub: 'New entry' },
    { id: 'Basic', label: 'L02', desc: 'BASIC', sub: 'Alpha ready' },
    { id: 'Intermediate', label: 'L03', desc: 'ACTIVE', sub: 'Fluent-ish' },
  ];

  const reasons = [
    { id: 'Personal', label: 'GROWTH', icon: '🌱', sub: 'Self' },
    { id: 'Professional', label: 'WORK', icon: '💼', sub: 'Career' },
    { id: 'Social', label: 'SOCIAL', icon: '🤝', sub: 'Community' },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-10 w-full text-center z-0 opacity-[0.01] pointer-events-none select-none">
        <h1 className="text-[12vw] font-black italic tracking-tighter uppercase leading-none">SYNC</h1>
      </div>

      <div className="w-full max-w-4xl z-10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="text-center space-y-3">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[1em]">PHASE 0{step} / 03</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            {step === 1 && "Daily Objective"}
            {step === 2 && "Skill Calibrator"}
            {step === 3 && "Core Catalyst"}
          </h2>
          <p className="text-zinc-600 text-base md:text-lg font-medium max-w-xl mx-auto leading-tight">
            {step === 1 && "Set your temporal commitment."}
            {step === 2 && "Determine your current sign spectrum."}
            {step === 3 && "Identify your primary motivation."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(step === 1 ? goals : step === 2 ? levels : reasons).map((item: any) => (
            <button
              key={item.id}
              onClick={() => {
                if (step === 1) setPreferences({ ...preferences, goal: item.id });
                if (step === 2) setPreferences({ ...preferences, level: item.id });
                if (step === 3) setPreferences({ ...preferences, reason: item.id });
              }}
              className={`p-6 rounded-[1.5rem] border text-left transition-all duration-500 relative flex flex-col justify-between min-h-[150px] ${
                (step === 1 ? preferences.goal : step === 2 ? preferences.level : preferences.reason) === item.id 
                  ? 'bg-white text-black border-white scale-102 shadow-xl' 
                  : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'
              }`}
            >
              <div>
                {item.icon && <div className="text-2xl mb-2">{item.icon}</div>}
                <h3 className="text-2xl font-black tracking-tighter uppercase mb-0.5 leading-none">{item.label}</h3>
                <p className={`text-[8px] font-black uppercase tracking-widest ${ (step === 1 ? preferences.goal : step === 2 ? preferences.level : preferences.reason) === item.id ? 'text-zinc-500' : 'text-zinc-700'}`}>
                  {item.desc}
                </p>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-tight mt-auto ${ (step === 1 ? preferences.goal : step === 2 ? preferences.level : preferences.reason) === item.id ? 'text-zinc-400' : 'text-zinc-800'}`}>
                {item.sub}
              </p>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center pt-6 gap-6">
           <button 
             onClick={handleNext}
             className="px-12 py-4 bg-white text-black font-black uppercase tracking-[0.3em] rounded-xl hover:bg-zinc-200 transition-all text-[10px] shadow-xl active:scale-95"
           >
             {step === 3 ? "Complete Sync" : "Next Phase"}
           </button>
           <div className="flex gap-3">
              {[1,2,3].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === step ? 'w-10 bg-white' : 'w-2 bg-zinc-900'}`} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
