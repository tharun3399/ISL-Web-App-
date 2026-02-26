import React, { useEffect, useState, useCallback } from "react";

// Full alphabet
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const SHUFFLE_DEPTH = 12; // number of random swaps when shuffling

// ---------- Utilities ----------

const getRandomLetter = () =>
  LETTERS[Math.floor(Math.random() * LETTERS.length)];

const getSolved = () => [...Array(9).keys()];

const getRow = (i: number) => Math.floor(i / 3);
const getCol = (i: number) => i % 3;

const isAdjacent = (i: number, j: number) => {
  return (
    (getRow(i) === getRow(j) && Math.abs(getCol(i) - getCol(j)) === 1) ||
    (getCol(i) === getCol(j) && Math.abs(getRow(i) - getRow(j)) === 1)
  );
};

// Controlled shuffle using only valid swaps so the puzzle is always solvable
const generateShuffled = (): number[] => {
  let arr = getSolved();
  let lastSwap: { from: number; to: number } | null = null;

  for (let k = 0; k < SHUFFLE_DEPTH; k++) {
    const index = Math.floor(Math.random() * 9);

    const neighbors: number[] = [];
    for (let j = 0; j < 9; j++) {
      if (isAdjacent(index, j)) neighbors.push(j);
    }

    if (neighbors.length === 0) continue;

    let swapWith = neighbors[Math.floor(Math.random() * neighbors.length)];

    // Avoid immediately undoing the previous swap
    if (lastSwap && swapWith === lastSwap.from) {
      swapWith = neighbors.find((n) => n !== lastSwap!.from) ?? swapWith;
    }

    [arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
    lastSwap = { from: index, to: swapWith };
  }

  // Ensure we don't end up in the already-solved state
  if (arr.every((v, i) => v === i)) {
    return generateShuffled();
  }

  return arr;
};

// ---------- Component ----------

const ISLPuzzleGame: React.FC = () => {
  const [currentLetter, setCurrentLetter] = useState<string>(getRandomLetter());
  const [tiles, setTiles] = useState<number[]>(generateShuffled());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [time, setTime] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // Reset puzzle (keep same letter)
  const resetPuzzle = useCallback(() => {
    setTiles(generateShuffled());
    setSelectedIndex(null);
    setIsSolved(false);
    setTime(0);
  }, []);

  // Reset when letter changes
  useEffect(() => {
    resetPuzzle();
  }, [currentLetter, resetPuzzle]);

  // Timer
  useEffect(() => {
    if (isSolved) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSolved]);

  // Check solved state
  useEffect(() => {
    const solved = tiles.every((val, idx) => val === idx);
    if (solved) setIsSolved(true);
  }, [tiles]);

  // Handle tile click
  const handleTileClick = (index: number) => {
    if (isSolved) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }

    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    if (isAdjacent(selectedIndex, index)) {
      const newTiles = [...tiles];
      [newTiles[selectedIndex], newTiles[index]] = [
        newTiles[index],
        newTiles[selectedIndex],
      ];
      setTiles(newTiles);
    }

    setSelectedIndex(null);
  };

  const nextLetter = () => {
    setCurrentLetter(getRandomLetter());
  };

  const previewOriginal = () => {
    setShowOriginal(true);
    setTimeout(() => setShowOriginal(false), 2000);
  };

  const getBackgroundPosition = (value: number) => {
    const row = getRow(value);
    const col = getCol(value);
    return `${col * 50}% ${row * 50}%`;
  };

  return (
    <div className="w-full flex justify-center py-8 relative">
      {/* Congrats popup when solved */}
      {isSolved && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 animate-in fade-in duration-200">
          <div className="bg-white text-black rounded-3xl px-8 py-6 md:px-10 md:py-8 shadow-2xl max-w-sm w-[90%] animate-in zoom-in duration-200">
            <h3 className="text-xl md:text-2xl font-black tracking-tight mb-2 text-center">
              Congratulations!
            </h3>
            <p className="text-xs md:text-sm text-zinc-700 text-center mb-5">
              You correctly assembled the ISL letter <span className="font-bold">{currentLetter}</span>.
              Keep practising with a new letter or replay this puzzle.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={resetPuzzle}
                className="px-4 py-2 bg-black text-white rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] hover:bg-zinc-800 transition-colors"
              >
                Replay Letter
              </button>
              <button
                onClick={() => {
                  nextLetter();
                  setIsSolved(false);
                }}
                className="px-4 py-2 bg-zinc-200 text-black rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] hover:bg-zinc-300 transition-colors"
              >
                New Letter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center max-w-md w-full">
        <h2 className="text-lg md:text-2xl font-bold mb-2 text-white">
          ISL Letter Puzzle
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mb-4 text-center max-w-sm">
          Tap two neighboring tiles to swap them and reconstruct the correct
          Indian Sign Language letter. Use the preview if you get stuck!
        </p>

        <div className="mb-2 font-medium text-sm md:text-base">
          Current Letter: <span className="font-bold">{currentLetter}</span>
        </div>
        <div className="mb-4 text-zinc-500 text-xs md:text-sm">
          Time Elapsed: {time}s
        </div>

        <div className="relative mb-4">
          {showOriginal && (
            <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center border border-zinc-700 rounded-2xl">
              <img
                src={`/islLetters/${currentLetter}.png`}
                alt="Original ISL letter"
                className="w-80 h-80 md:w-96 md:h-96 object-cover rounded-2xl"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-1 w-80 h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
            {tiles.map((tile, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTileClick(index)}
                className={`w-full h-full cursor-pointer transition-all duration-150 focus:outline-none ${
                  selectedIndex === index
                    ? "ring-2 md:ring-4 ring-white"
                    : "focus:ring-2 focus:ring-zinc-500"
                }`}
                style={{
                  backgroundImage: `url(/islLetters/${currentLetter}.png)`,
                  backgroundSize: "300% 300%",
                  backgroundPosition: getBackgroundPosition(tile),
                }}
                aria-label="Puzzle tile"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <button
            onClick={resetPuzzle}
            className="px-4 py-2 bg-white text-black rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] hover:bg-zinc-200 transition-colors"
          >
            Restart
          </button>

          <button
            onClick={nextLetter}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] hover:bg-zinc-700 transition-colors"
          >
            New Letter
          </button>

          <button
            onClick={previewOriginal}
            className="px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] hover:bg-zinc-800 transition-colors"
          >
            Preview Sign
          </button>
        </div>
      </div>
    </div>
  );
};

export default ISLPuzzleGame;
