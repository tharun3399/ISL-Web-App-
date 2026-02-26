
import React from 'react';
import ISLPuzzleGame from './ISLPuzzleGame';

const GamesPage: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-16">
      <header className="space-y-3">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
          PRACTISE THROUGH PLAY
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
          ISL Puzzle Lab
        </h1>
        <p className="text-zinc-500 text-sm md:text-base max-w-xl leading-snug font-medium">
          Strengthen your visual memory of Indian Sign Language letters by solving a
          3×3 image puzzle. Arrange the tiles to reveal the correct sign for each
          letter.
        </p>
      </header>

      <section className="bg-zinc-950/40 border border-zinc-900 rounded-[2.5rem] p-6 md:p-10 flex flex-col items-center">
        <ISLPuzzleGame />
      </section>
    </div>
  );
};

export default GamesPage;
