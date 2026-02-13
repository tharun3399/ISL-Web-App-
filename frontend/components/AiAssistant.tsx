
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const AiAssistant: React.FC = () => {
  const [insight, setInsight] = useState<string>('Initializing systems...');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAiInsight = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "As an Indian Sign Language (ISL) learning coach, provide a one-sentence motivation or specific technical tip for a student who just hit a 12-day streak and is focusing on Conversational ISL. Keep it short and minimalist.",
          config: {
            temperature: 0.7,
            topP: 0.95,
          },
        });
        setInsight(response.text || 'Keep pushing! Your dedication is showing results.');
      } catch (error) {
        setInsight('Focus on your wrist rotation during the alphabet A-Z sequence today.');
      } finally {
        setLoading(false);
      }
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
        <h3 className="font-bold text-[10px] uppercase tracking-[0.4em]">AI STRATEGY</h3>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-zinc-100 w-full animate-pulse rounded"></div>
          <div className="h-4 bg-zinc-100 w-2/3 animate-pulse rounded"></div>
        </div>
      ) : (
        <p className="text-xl font-bold leading-snug tracking-tight">
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
