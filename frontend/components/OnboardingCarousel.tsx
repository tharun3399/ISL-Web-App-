
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onboardingSteps = [
    {
      title: "FOUNDATIONAL GESTURES",
      description: "Initialize your journey by mastering the core architectural signs of Indian Sign Language.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    {
      title: "EXPRESSIVE DYNAMICS",
      description: "Unlock the depth of communication through nuanced facial markers and hand velocity.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    },
    {
      title: "SYNTACTIC PRECISION",
      description: "Refine your grammar and structure to ensure absolute clarity in every interaction.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    },
    {
      title: "COGNITIVE SYNC",
      description: "Bridge the gap between thought and motion with our real-time AI feedback system.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    },
    {
      title: "TOTAL FLUENCY",
      description: "Achieve the ultimate state of silent communication. The barrier is now non-existent.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
    }
  ];

  useEffect(() => {
    if (videoRef.current) {
      setIsLoading(true);
      setHasError(false);
      videoRef.current.load();
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay restriction:", error);
          setIsPaused(true);
          setIsLoading(false);
        });
      }
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate('/auth');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start pt-20 px-4 pb-20 relative overflow-hidden">
      <div className="absolute top-10 left-0 w-full flex flex-col items-center pointer-events-none select-none z-0 opacity-10">
        <h2 className="text-[12vw] font-black tracking-[-0.05em] leading-none uppercase italic">ISL ARCHITECT</h2>
        <h2 className="text-[8vw] font-black tracking-[0.5em] leading-none uppercase mt-[-2vw]">MODULES</h2>
      </div>

      <button 
        onClick={() => navigate('/auth')}
        className="absolute top-10 right-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-all z-50 border border-zinc-900 px-6 py-3 rounded-full hover:bg-white hover:text-black"
      >
        PROCEED
      </button>

      <div className="max-w-7xl w-full z-10 flex flex-col items-center space-y-10 animate-in fade-in duration-1000">
        <div 
          className="relative w-full aspect-video md:aspect-[21/9] rounded-[3rem] md:rounded-[5rem] overflow-hidden bg-zinc-950 border-8 border-zinc-900 shadow-[0_0_150px_rgba(255,255,255,0.03)] group cursor-pointer"
          onClick={togglePlay}
        >
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-30">
              <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Loading Visual Stream</p>
            </div>
          )}

          {isPaused && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
               <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-white scale-100 hover:scale-110 transition-transform">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
               </div>
            </div>
          )}

          <video 
            ref={videoRef}
            loop 
            muted 
            playsInline
            onCanPlay={() => { setIsLoading(false); setHasError(false); }}
            onPlaying={() => { setIsLoading(false); setIsPaused(false); }}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-all duration-1000 ${isLoading ? 'opacity-0' : 'opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`}
          >
            <source src={onboardingSteps[currentIndex].videoUrl} type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute bottom-10 left-10 md:bottom-20 md:left-20">
             <div className="flex gap-4 items-center mb-4">
                <span className="text-[10px] font-black bg-white text-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                   Module {currentIndex + 1}
                </span>
                <span className="text-[10px] font-black border border-zinc-700 text-zinc-500 px-4 py-1.5 rounded-full uppercase tracking-widest">
                   4K Resolution
                </span>
             </div>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between items-start gap-12 pt-6">
           <div className="flex-1 space-y-4">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none transition-all duration-700">
                {onboardingSteps[currentIndex].title}
              </h2>
              <p className="text-zinc-500 text-lg md:text-2xl font-medium tracking-tight max-w-3xl leading-snug">
                {onboardingSteps[currentIndex].description}
              </p>
           </div>

           <div className="flex flex-col items-end gap-10 min-w-[200px]">
              <div className="flex items-center gap-6">
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  disabled={currentIndex === 0}
                  className={`w-20 h-20 rounded-full border border-zinc-900 flex items-center justify-center transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-zinc-900 text-white active:scale-90'}`}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white text-black flex items-center justify-center transition-all hover:scale-105 active:scale-90 shadow-[0_0_80px_rgba(255,255,255,0.15)]"
                >
                  {currentIndex === onboardingSteps.length - 1 ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6 9 17l-5-5"/></svg>
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                {onboardingSteps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-700 ${i === currentIndex ? 'w-20 bg-white' : 'w-4 bg-zinc-900'}`}
                  />
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCarousel;