import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  containerClassName?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  showControls?: boolean;
  showPlayOverlay?: boolean;
  clickToToggle?: boolean;
}

/**
 * Reusable video player with the same UX as the onboarding carousel.
 * - Loading overlay spinner
 * - Click to toggle play/pause with big play overlay
 * - Subtle gradient overlay and smooth fade-in
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  containerClassName = '',
  videoClassName = '',
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  showControls = false,
  showPlayOverlay = true,
  clickToToggle = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reload and attempt autoplay when src changes
  useEffect(() => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setHasError(false);
    setIsPaused(false);
    try {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay might be blocked; show play overlay
          setIsPaused(true);
          setIsLoading(false);
        });
      }
    } catch {
      setHasError(true);
      setIsLoading(false);
    }
  }, [src]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  return (
    <div
      className={
        `relative rounded-[2.5rem] overflow-hidden bg-zinc-950 border border-zinc-900 shadow-[0_0_100px_rgba(255,255,255,0.02)] group ${clickToToggle ? 'cursor-pointer' : ''} ${containerClassName}`
      }
      onClick={clickToToggle ? togglePlay : undefined}
    >
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-30">
          <div className="w-10 h-10 border-t-2 border-white rounded-full animate-spin mb-4"></div>
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Calibrating Stream</p>
        </div>
      )}

      {showPlayOverlay && isPaused && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
          <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-white scale-100 hover:scale-110 transition-transform">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        controls={showControls}
        onCanPlay={() => { setIsLoading(false); setHasError(false); }}
        onPlaying={() => { setIsLoading(false); setIsPaused(false); }}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'} ${videoClassName}`}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Gradient overlay for subtle contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
    </div>
  );
};

export default VideoPlayer;
