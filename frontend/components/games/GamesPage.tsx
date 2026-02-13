
import React, { useState } from 'react';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  status: 'available' | 'locked' | 'live';
  icon: React.ReactNode;
  onAction?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, type, difficulty, status, icon, onAction }) => (
  <div className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col justify-between min-h-[320px]
    ${status === 'locked' ? 'bg-zinc-950 border-zinc-900 opacity-60' : 'bg-[#080808] border-zinc-800 hover:border-white hover:-translate-y-2 shadow-2xl shadow-white/0 hover:shadow-white/5'}`}>
    
    <div className="flex justify-between items-start mb-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500
        ${status === 'locked' ? 'bg-zinc-900 border-zinc-800 text-zinc-700' : 'bg-white border-white text-black shadow-xl group-hover:scale-110'}`}>
        {icon}
      </div>
      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-2
        ${status === 'locked' ? 'border-zinc-900 text-zinc-700' : 
          status === 'live' ? 'border-white bg-white text-black' : 'border-zinc-700 text-zinc-400'}`}>
        {status === 'live' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
        {status === 'locked' ? 'LOCKED' : status === 'live' ? 'LIVE NOW' : 'READY'}
      </div>
    </div>

    <div>
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2">{type} • {difficulty}</p>
      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm font-medium leading-tight max-w-xs">{description}</p>
    </div>

    <button 
      disabled={status === 'locked'}
      onClick={onAction}
      className={`w-full mt-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all
        ${status === 'locked' ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-lg'}`}>
      {status === 'locked' ? 'ACCESS DENIED' : status === 'live' ? 'JOIN SYNC' : 'INITIALIZE'}
    </button>
  </div>
);

const GamesPage: React.FC = () => {
  const [view, setView] = useState<'main' | 'duel' | 'live'>('main');

  const arenaGames: GameCardProps[] = [
    {
      id: 'duel-lobby',
      title: "DUEL Lobby",
      description: "Peer-to-peer neural combat. Challenge other learners in real-time gesture translation.",
      type: "MULTIPLAYER",
      difficulty: "Expert",
      status: 'available',
      onAction: () => setView('duel'),
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    {
      id: 'live-games',
      title: "Live Games",
      description: "Join ongoing neural streams. Spectate or jump into the active broadcast arena.",
      type: "BROADCAST",
      difficulty: "Dynamic",
      status: 'live',
      onAction: () => setView('live'),
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
    }
  ];

  if (view === 'duel') {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700 pb-20">
        <header className="flex justify-between items-end border-b border-zinc-900 pb-10">
          <div className="space-y-2">
            <button onClick={() => setView('main')} className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors mb-4 block">← BACK TO ARENA</button>
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">DUEL Lobby</h1>
            <p className="text-zinc-500 text-lg font-medium">Neural Matchmaking Protocol: Active</p>
          </div>
          <div className="bg-white text-black px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl">Searching for Opponent...</div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Active Challengers</h3>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[#080808] border border-zinc-900 rounded-3xl p-6 flex items-center justify-between group hover:border-white transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center font-black text-zinc-600 border border-zinc-800 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all">P{i}</div>
                  <div>
                    <p className="text-white font-black italic uppercase tracking-tighter">Neural_Entity_{i}82</p>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Level {10 - i} • 24ms Latency</p>
                  </div>
                </div>
                <button className="px-6 py-2 border border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Challenge</button>
              </div>
            ))}
          </div>
          <div className="bg-[#050505] border border-zinc-900 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-8">
             <div className="w-24 h-24 border border-zinc-800 rounded-full flex items-center justify-center animate-pulse">
               <div className="w-12 h-12 bg-zinc-900 rounded-full"></div>
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Waiting for Sync</h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest max-w-xs">Challengers are vetted for neural compatibility before matchmaking commences.</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'live') {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700 pb-20">
        <header className="flex justify-between items-end border-b border-zinc-900 pb-10">
          <div className="space-y-2">
            <button onClick={() => setView('main')} className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors mb-4 block">← BACK TO ARENA</button>
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Live Games</h1>
            <p className="text-zinc-500 text-lg font-medium">Ongoing Neural Streams: 03 Active</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Broadcast Online</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="group bg-[#080808] border border-zinc-900 rounded-[2.5rem] overflow-hidden hover:border-white transition-all duration-500">
               <div className="aspect-video bg-zinc-950 relative">
                  <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">LIVE</div>
                  <div className="absolute top-4 right-4 z-10 bg-black/60 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                     {i * 124}
                  </div>
                  <div className="w-full h-full flex items-center justify-center opacity-20 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0 overflow-hidden">
                     <img src={`https://images.unsplash.com/photo-${1516733968668 + i}-dbdce39c46ef?auto=format&fit=crop&q=80&w=400`} className="w-full h-full object-cover" />
                  </div>
               </div>
               <div className="p-8 space-y-4">
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Neural Stream #{i}42</h3>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Host: Master_Sync_{i}</p>
                  </div>
                  <button className="w-full py-4 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl group-hover:bg-white group-hover:text-black group-hover:border-white transition-all">Enter Stream</button>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-20">
      <header className="space-y-2">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">NEURAL SIMULATION LAB</p>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Games</h1>
        <p className="text-zinc-500 text-lg max-w-xl leading-tight font-medium">Engage in high-stress neural mappings to solidify your communication protocols.</p>
      </header>

      <section className="space-y-8">
        <h2 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.6em] border-b border-zinc-900 pb-4">Multiplayer Arena</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {arenaGames.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </section>

      <div className="bg-zinc-950/40 border border-zinc-900 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-4">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Global Ranking</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Neural synchronization active across 12 zones.</p>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group hover:border-white transition-all">
              <span className="text-xs font-black text-zinc-500 group-hover:text-white">{i}</span>
              <div className="w-6 h-1 bg-zinc-800 rounded-full mt-1 group-hover:bg-white transition-all"></div>
            </div>
          ))}
          <button className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-white transition-all">
            Registry
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
