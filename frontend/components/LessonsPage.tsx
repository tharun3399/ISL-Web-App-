
import React, { useState, useEffect } from 'react';

// --- Types & Interfaces ---

export interface Clip {
  id?: string;
  title: string;
  videoUrl: string;
}

export interface Topic {
  id: string;
  title: string;
  type: 'Video' | 'Practice' | 'Quiz';
  duration: string;
  completed: boolean;
  image: string;
  clips: Clip[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  difficulty: 'Basic' | 'Medium' | 'Advanced';
  duration: string;
  coordinates: { x: number; y: number };
  prerequisiteId?: string;
  topics: Topic[];
}

const LessonsPage: React.FC = () => {
  // --- State ---
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTopicIndex, setActiveTopicIndex] = useState<number | null>(null);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [lockedAlert, setLockedAlert] = useState<string | null>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const loadLessons = async () => {
      setLoading(true);
      try {
        // NOTE TO USER: Replace this block with your database fetch call.
        // Example: const { data } = await supabase.from('lessons').select('*');
        
        // Simulating a network delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock data initialization (This would come from your DB)
        const mockData: Lesson[] = [
          {
            id: '01',
            title: "Alpha Priming",
            description: "Initialize cognitive patterns for basic hand-shapes.",
            status: 'completed',
            difficulty: 'Basic',
            duration: '15m',
            coordinates: { x: 25, y: 15 },
            topics: [
              { id: 'T1', title: 'Hand Anatomy 101', type: 'Video', duration: '3m', completed: true, image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c46ef?auto=format&fit=crop&q=80&w=400', clips: [{title: 'Initial Phase', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}, {title: 'Core Movement', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'}] },
            ]
          },
          {
            id: '02',
            title: "Dynamic Numbers",
            description: "Quantifying concepts using spatial mathematics.",
            status: 'completed',
            difficulty: 'Basic',
            duration: '20m',
            coordinates: { x: 75, y: 30 },
            prerequisiteId: '01',
            topics: [
              { id: 'T1', title: 'Cardinal Numbers', type: 'Video', duration: '6m', completed: true, image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=400', clips: [{title: 'Counting 1-10', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'}] },
            ]
          },
          {
            id: '03',
            title: "Identity Protocols",
            description: "Communicating personal identifiers and roles.",
            status: 'active',
            difficulty: 'Medium',
            duration: '35m',
            coordinates: { x: 25, y: 45 },
            prerequisiteId: '02',
            topics: [
              { id: 'T1', title: 'Personal Pronouns', type: 'Video', duration: '5m', completed: true, image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=400', clips: [{title: 'Identity Basics', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'}] },
            ]
          },
          {
            id: '04',
            title: "Spatial Vectors",
            description: "Mastering directions and environment mapping.",
            status: 'locked',
            difficulty: 'Medium',
            duration: '40m',
            coordinates: { x: 75, y: 60 },
            prerequisiteId: '03',
            topics: []
          },
          {
            id: '05',
            title: "Temporal Flow",
            description: "Structuring time and future projections.",
            status: 'locked',
            difficulty: 'Advanced',
            duration: '50m',
            coordinates: { x: 25, y: 75 },
            prerequisiteId: '04',
            topics: []
          },
          {
            id: '06',
            title: "Total Synthesis",
            description: "Final integration of all communicative streams.",
            status: 'locked',
            difficulty: 'Advanced',
            duration: '1.5h',
            coordinates: { x: 50, y: 90 },
            prerequisiteId: '05',
            topics: []
          }
        ];
        
        setLessons(mockData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load map data:", err);
        setError("Network Protocol Failure: Unable to sync with Skill Map.");
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  // --- Handlers ---
  const handleNextClip = () => {
    if (!selectedLesson || activeTopicIndex === null) return;
    
    const currentTopic = selectedLesson.topics[activeTopicIndex];
    if (activeClipIndex < currentTopic.clips.length - 1) {
      setActiveClipIndex(activeClipIndex + 1);
    } else {
      if (activeTopicIndex < selectedLesson.topics.length - 1) {
        setActiveTopicIndex(activeTopicIndex + 1);
        setActiveClipIndex(0);
      } else {
        setActiveTopicIndex(null);
        setActiveClipIndex(0);
      }
    }
  };

  const handlePrevClip = () => {
    if (activeClipIndex > 0) {
      setActiveClipIndex(activeClipIndex - 1);
    } else if (activeTopicIndex !== null && activeTopicIndex > 0) {
      const prevTopicIndex = activeTopicIndex - 1;
      setActiveTopicIndex(prevTopicIndex);
      setActiveClipIndex(selectedLesson!.topics[prevTopicIndex].clips.length - 1);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status === 'locked') {
      const prereq = lessons.find(l => l.id === lesson.prerequisiteId);
      setLockedAlert(prereq ? prereq.title : "previous modules");
      setTimeout(() => setLockedAlert(null), 3000);
      return;
    }
    setSelectedLesson(lesson);
  };

  // --- Conditional Render: Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-t-2 border-white rounded-full animate-spin opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-white animate-pulse rounded-full"></div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[1em] animate-pulse">Syncing Map Coordinates</p>
          <p className="text-xs font-bold text-zinc-800 uppercase tracking-widest">Establishing Secure Uplink...</p>
        </div>
      </div>
    );
  }

  // --- Conditional Render: Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{error}</h2>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-xl hover:bg-zinc-200 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // --- UI Views: Playback View ---
  if (selectedLesson && activeTopicIndex !== null) {
    const currentTopic = selectedLesson.topics[activeTopicIndex];
    const currentClip = currentTopic.clips[activeClipIndex];
    
    return (
      <div className="min-h-screen pb-40 animate-in fade-in duration-700 bg-black text-white overflow-hidden relative flex flex-col">
        <div className="pt-12 px-10 flex justify-between items-center z-50">
           <div className="flex-1">
             <button 
               onClick={() => { setActiveTopicIndex(null); setActiveClipIndex(0); }}
               className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all group"
             >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
                 <path d="M19 12H5m7-7-7 7 7 7"/>
               </svg>
               EXIT
             </button>
           </div>
           <div className="flex-1 text-center">
             <h2 className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">
               UNIT {activeTopicIndex + 1}.{activeClipIndex + 1}
             </h2>
           </div>
           <div className="flex-1 text-right">
             <div className="inline-block px-4 py-1.5 rounded-full border border-zinc-900 bg-zinc-950 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
               {selectedLesson.difficulty} MODE
             </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-5xl mx-auto w-full">
          <div className="relative w-full max-w-2xl group mb-8">
             <button 
               onClick={handlePrevClip}
               disabled={activeTopicIndex === 0 && activeClipIndex === 0}
               className={`absolute -left-20 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-zinc-900 flex items-center justify-center transition-all hidden lg:flex ${activeTopicIndex === 0 && activeClipIndex === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-white hover:text-black hover:scale-110 active:scale-95'}`}
             >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
             </button>
             <button 
               onClick={handleNextClip}
               className={`absolute -right-20 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-zinc-900 flex items-center justify-center transition-all hidden lg:flex hover:bg-white hover:text-black hover:scale-110 active:scale-95`}
             >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
             </button>
             <div className="aspect-video w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-950 border-2 border-zinc-900 shadow-[0_0_80px_rgba(255,255,255,0.02)] ring-1 ring-white/5">
               <video 
                 key={currentClip.videoUrl + activeClipIndex}
                 autoPlay
                 loop
                 muted
                 playsInline
                 onEnded={handleNextClip}
                 className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
               >
                 <source src={currentClip.videoUrl} type="video/mp4" />
               </video>
             </div>
          </div>

          <div className="w-full max-w-2xl text-center space-y-4 animate-in slide-in-from-bottom-4 duration-500">
             <div className="space-y-2">
               <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.6em]">{currentTopic.title}</p>
               <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic leading-tight text-white">
                 {currentClip.title}
               </h1>
             </div>
             <div className="flex flex-col items-center gap-6">
               <div className="flex justify-center items-center gap-2">
                 {currentTopic.clips.map((_, idx) => (
                   <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${idx === activeClipIndex ? 'w-10 bg-white shadow-[0_0_10px_white]' : 'w-3 bg-zinc-900'}`} />
                 ))}
               </div>
               <div className="flex items-center gap-8 pt-2">
                  <div className="text-center">
                     <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1">Topic</p>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{currentTopic.type}</p>
                  </div>
                  <div className="w-px h-6 bg-zinc-900"></div>
                  <div className="text-center">
                     <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-1">Duration</p>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{currentTopic.duration}</p>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- UI Views: Topic List View ---
  if (selectedLesson) {
    return (
      <div className="min-h-screen pb-40 animate-in fade-in slide-in-from-right-8 duration-700 relative">
        <header className="relative py-20 overflow-hidden border-b border-zinc-900 mb-12">
          <button 
            onClick={() => setSelectedLesson(null)}
            className="absolute top-10 left-0 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all group z-20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
              <path d="M19 12H5m7-7-7 7 7 7"/>
            </svg>
            Back to Map
          </button>
          <div className="absolute top-0 right-0 w-full h-full flex items-center justify-end opacity-[0.03] pointer-events-none select-none">
            <h1 className="text-[18vw] font-black italic tracking-tighter uppercase leading-none">{selectedLesson.id}</h1>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
               <span className="bg-white text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">MODULE {selectedLesson.id}</span>
               <span className="border border-zinc-800 text-zinc-500 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">{selectedLesson.difficulty}</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-none">{selectedLesson.title}</h1>
            <p className="text-zinc-500 max-w-2xl text-xl font-medium leading-tight">{selectedLesson.description}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {selectedLesson.topics.map((topic, index) => (
            <div 
              key={topic.id}
              onClick={() => { setActiveTopicIndex(index); setActiveClipIndex(0); }}
              className="group relative bg-[#080808] border border-zinc-900 rounded-[2.5rem] overflow-hidden hover:border-zinc-500 transition-all duration-500 hover:-translate-y-2 cursor-pointer shadow-2xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src={topic.image} alt={topic.title} className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-1000 opacity-40 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute top-6 left-6 flex gap-2">
                   <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${topic.completed ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-zinc-700'}`}></div>
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">{topic.type}</span>
                   </div>
                </div>
                {topic.completed && (
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                )}
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2 group-hover:text-zinc-200">{topic.title}</h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{topic.clips.length} Units • {topic.duration} Est.</p>
                </div>
                <button className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all
                  ${topic.completed ? 'bg-zinc-900 text-zinc-500 border border-zinc-800' : 'bg-white text-black hover:scale-[1.02] shadow-xl'}`}>
                  {topic.completed ? 'REVISIT MODULE' : 'START JOURNEY'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- UI Views: Skill Map View ---
  return (
    <div className="min-h-screen pb-40 animate-in fade-in duration-1000 relative">
      <header className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <h1 className="text-[20vw] font-black italic tracking-tighter uppercase leading-none">CARTOGRAPHY</h1>
        </div>
        <div className="relative z-10 text-center space-y-4">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[1.5em] mb-4">Syllabus Navigation</p>
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white uppercase italic">The Skill Map</h1>
          <p className="text-zinc-500 max-w-2xl mx-auto text-xl font-medium leading-tight px-6">
            Navigate through the neural territories of ISL. Your progress carves a path through the silence.
          </p>
        </div>
      </header>

      {lockedAlert && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/50 px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <div>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Access Denied</p>
                <p className="text-sm font-bold text-white uppercase italic tracking-tight">Requirement: Complete {lockedAlert}</p>
              </div>
           </div>
        </div>
      )}

      <div className="relative max-w-5xl mx-auto mt-10 px-4">
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 800 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="300" r="150" stroke="white" strokeWidth="0.2" />
            <circle cx="600" cy="800" r="200" stroke="white" strokeWidth="0.2" />
          </svg>
        </div>

        <div className="absolute inset-0 pointer-events-none z-0">
          <svg width="100%" height="100%" className="overflow-visible">
            <path
              d="M 25% 15% C 50% 15%, 75% 20%, 75% 30% S 50% 45%, 25% 45% S 75% 50%, 75% 60% S 40% 75%, 25% 75% S 40% 90%, 50% 90%"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Find the path point for active/completed highlight logic */}
            <path
              d="M 25% 15% C 50% 15%, 75% 20%, 75% 30% S 50% 45%, 25% 45%"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            />
          </svg>
        </div>

        <div className="relative min-h-[1200px]">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              className={`absolute group transition-transform duration-500 ${lesson.status === 'locked' && lockedAlert ? 'animate-shake' : ''}`}
              style={{ 
                left: `${lesson.coordinates.x}%`, 
                top: `${lesson.coordinates.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className="relative flex items-center justify-center cursor-pointer"
                onClick={() => handleLessonClick(lesson)}
              >
                <div className={`absolute w-16 h-16 rounded-full border transition-all duration-700 
                  ${lesson.status === 'active' ? 'border-white animate-pulse scale-125' : 
                    lesson.status === 'completed' ? 'border-zinc-700 bg-zinc-900/20' : 'border-zinc-900 bg-black'}`} 
                />
                
                <div className={`w-8 h-8 rounded-full z-10 flex items-center justify-center text-[10px] font-black transition-all duration-500
                  ${lesson.status === 'active' ? 'bg-white text-black shadow-[0_0_25px_#fff]' : 
                    lesson.status === 'completed' ? 'bg-zinc-800 text-white' : 
                    'bg-zinc-950 text-zinc-800 border border-zinc-900'}`}
                >
                  {lesson.status === 'completed' ? '✓' : 
                   lesson.status === 'locked' ? (
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                     </svg>
                   ) : lesson.id}
                </div>

                <div className={`absolute left-20 md:left-24 w-64 p-6 rounded-3xl border bg-black/90 backdrop-blur-xl transition-all duration-500 z-50
                  ${lesson.status === 'active' ? 'opacity-100 translate-x-0 border-zinc-500 shadow-2xl' : 'opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 border-zinc-800 shadow-xl'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${lesson.status === 'locked' ? 'text-red-500' : 'text-zinc-500'}`}>
                      {lesson.status === 'locked' ? 'LOCKED PROTOCOL' : lesson.difficulty}
                    </span>
                    <span className="text-[9px] font-black text-white bg-zinc-900 px-2 py-0.5 rounded-full uppercase tracking-tighter">{lesson.duration}</span>
                  </div>
                  
                  <h3 className="text-xl font-black uppercase italic text-white mb-2 leading-none">{lesson.title}</h3>
                  <p className="text-zinc-500 text-xs font-medium mb-5 leading-relaxed">{lesson.description}</p>
                  
                  {lesson.status === 'locked' && (
                    <div className="mb-4 p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                       <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1">Requirement</p>
                       <p className="text-[10px] font-bold text-zinc-400">Complete "{lessons.find(l => l.id === lesson.prerequisiteId)?.title}" to unlock.</p>
                    </div>
                  )}

                  <button 
                    disabled={lesson.status === 'locked'}
                    className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all
                      ${lesson.status === 'completed' ? 'bg-zinc-900 text-zinc-400 border border-zinc-800' : 
                        lesson.status === 'active' ? 'bg-white text-black hover:scale-105 shadow-lg shadow-white/5' : 
                        'bg-zinc-950 text-zinc-800 cursor-not-allowed border border-zinc-900'}`}
                  >
                    {lesson.status === 'locked' ? 'Access Restricted' : lesson.status === 'completed' ? 'Revisit Module' : 'Initialize'}
                  </button>
                </div>
              </div>

              <div className="mt-12 text-center whitespace-nowrap">
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors
                  ${lesson.status === 'active' ? 'text-white' : lesson.status === 'locked' ? 'text-zinc-800' : 'text-zinc-600'}`}>
                  {lesson.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-zinc-950/80 backdrop-blur-2xl px-10 py-5 rounded-full border border-zinc-900 flex items-center gap-10 shadow-2xl">
          <div className="flex items-center gap-3 border-r border-zinc-900 pr-10">
            <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#fff]"></div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active Territory</p>
              <p className="text-sm font-black uppercase tracking-tight">
                {lessons.find(l => l.status === 'active')?.title || "Module Integration"}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-[14px] font-black leading-none">
                {Math.round((lessons.filter(l => l.status === 'completed').length / lessons.length) * 100) || 0}%
              </p>
              <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Explored</p>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-black leading-none">
                {lessons.filter(l => l.status !== 'locked').length.toString().padStart(2, '0')}
              </p>
              <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Unlocked</p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(-50%); }
          25% { transform: translateX(-52%); }
          75% { transform: translateX(-48%); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
          animation-iteration-count: 2;
        }
      `}</style>
    </div>
  );
};

export default LessonsPage;
