
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 4500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
      
      <div className="relative text-center space-y-2 px-6">
        <p className="text-[10px] font-black tracking-[1.2em] text-zinc-600 uppercase mb-4 animate-pulse">ESTABLISHING CONNECTION</p>
        <div className="animate-splash-sequence">
          <h1 className="text-[8vw] md:text-[6vw] font-black text-white tracking-tighter italic uppercase leading-none">
            Welcome to
          </h1>
          <h1 className="text-[12vw] md:text-[10vw] font-black text-white tracking-tighter uppercase leading-none mt-[-2vw]">
            ISL Academy
          </h1>
        </div>
        <div className="mt-12 flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
           <div className="w-12 h-[1px] bg-zinc-800"></div>
           <p className="text-[10px] font-bold text-zinc-500 tracking-[0.4em] uppercase">Visual Systems Ready</p>
           <div className="w-12 h-[1px] bg-zinc-800"></div>
        </div>
      </div>

      <style>{`
        @keyframes splashSequence {
          0% { opacity: 0; transform: scale(0.95); filter: blur(10px); }
          20% { opacity: 1; transform: scale(1); filter: blur(0px); }
          80% { opacity: 1; transform: scale(1); filter: blur(0px); }
          100% { opacity: 0; transform: scale(1.05); filter: blur(10px); }
        }
        .animate-splash-sequence {
          animation: splashSequence 4.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashPage;