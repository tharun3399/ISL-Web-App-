
import React, { useState, useEffect } from 'react';

const AiAssistant: React.FC = () => {
  const [insight, setInsight] = useState<string>('Initializing systems...');
  const [loading, setLoading] = useState<boolean>(true);

  const LOCAL_TIPS = [
    "Focus on your wrist rotation during the alphabet A-Z sequence today.",
    "Neural patterns suggest practicing 'Temporal Flow' for 5 extra minutes.",
    "Your finger-spelling velocity has increased by 12%. Maintain the rhythm.",
    "Remember: The spatial plane between your shoulders is your primary canvas.",
    "Status check: Your 12-day streak is currently in the top 5% of learners."
  ];

  useEffect(() => {
    const fetchAiInsight = async () => {
      setLoading(true);
      // Simulate local processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const randomTip = LOCAL_TIPS[Math.floor(Math.random() * LOCAL_TIPS.length)];
      setInsight(randomTip);
      setLoading(false);
    };

    fetchAiInsight();
  }, []);

  return (
    <div className="bg-white text-black p-8 rounded-[2rem] shadow-2xl shadow-white/5 relative group">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black"></div>
          <div className="w-1 h-3 bg-zinc-400"></div>
          <div className="w-1 h-3 bg-zinc-200"></div>
        </div>
        <h3 className="font-bold text-[10px] uppercase tracking-[0.4em]">NEURAL INSIGHT</h3>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-zinc-100 w-full animate-pulse rounded"></div>
          <div className="h-4 bg-zinc-100 w-2/3 animate-pulse rounded"></div>
        </div>
      ) : (
        <p className="text-xl font-bold leading-snug tracking-tight italic">
          "{insight}"
        </p>
      )}
      
      <div className="mt-8">
        <button className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
          View Detailed Plan
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;
