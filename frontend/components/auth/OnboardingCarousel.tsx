
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
      title: "BULB",
      description: "Learn to express the concept of light and illumination.",
      videoUrl: "/VideosOnboard/Bulb.mp4"
    },
    {
      title: "CHAPPATHI",
      description: "Master the signs for traditional Indian cuisine.",
      videoUrl: "/VideosOnboard/Chappathi.mp4"
    },
    {
      title: "CLIMB",
      description: "Develop the gestures for movement and elevation.",
      videoUrl: "/VideosOnboard/Climb.mp4"
    },
    {
      title: "NERVOUS",
      description: "Express emotions and psychological states with precision.",
      videoUrl: "/VideosOnboard/Nervous.mp4"
    },
    {
      title: "PIZZA",
      description: "Expand your vocabulary with everyday objects and food.",
      videoUrl: "/VideosOnboard/Pizza.mp4"
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start pt-16 px-4 pb-20 relative overflow-hidden">
      {/* Background Watermark - Reduced scale */}
      <div className="absolute top-10 left-0 w-full flex flex-col items-center pointer-events-none select-none z-0 opacity-[0.05]">
        <h2 className="text-[8vw] font-black tracking-[-0.05em] leading-none uppercase italic">ISL ARCHITECT</h2>
        <h2 className="text-[5vw] font-black tracking-[0.5em] leading-none uppercase mt-[-1vw]">MODULES</h2>
      </div>

      <button 
        onClick={() => navigate('/auth')}
        className="absolute top-10 right-10 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-all z-50 border border-zinc-900 px-5 py-2.5 rounded-full hover:bg-white hover:text-black"
      >
        PROCEED
      </button>

      <div className="max-w-5xl w-full z-10 flex flex-col items-center space-y-12 animate-in fade-in duration-1000">
        {/* Video Container - Reduced size and max-width */}
        <div 
          className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-zinc-950 border-4 border-zinc-900 shadow-[0_0_100px_rgba(255,255,255,0.02)] group cursor-pointer mx-auto"
          style={{width: '480px', height: '480px', maxWidth: '100%'}}
          onClick={togglePlay}
        >
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-30">
              <div className="w-10 h-10 border-t-2 border-white rounded-full animate-spin mb-4"></div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Calibrating Stream</p>
            </div>
          )}

          {isPaused && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
               <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-white scale-100 hover:scale-110 transition-transform">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
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
            className={`w-full h-full object-cover transition-all duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          >
            <source src={onboardingSteps[currentIndex].videoUrl} type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          

        </div>

        {/* Text Content - Reduced Typography Scale */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-10 max-w-4xl pt-4">
           <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none transition-all duration-700 italic">
                {onboardingSteps[currentIndex].title}
              </h2>
              <p className="text-zinc-500 text-base md:text-lg font-medium tracking-tight max-w-2xl leading-snug">
                {onboardingSteps[currentIndex].description}
              </p>
           </div>

           <div className="flex flex-col items-center md:items-end gap-8 min-w-[180px]">
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  disabled={currentIndex === 0}
                  className={`w-14 h-14 rounded-full border border-zinc-900 flex items-center justify-center transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-zinc-900 text-white active:scale-90'}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center transition-all hover:scale-105 active:scale-90 shadow-xl"
                >
                  {currentIndex === onboardingSteps.length - 1 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6 9 17l-5-5"/></svg>
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                {onboardingSteps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-700 ${i === currentIndex ? 'w-12 bg-white' : 'w-3 bg-zinc-900'}`}
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
