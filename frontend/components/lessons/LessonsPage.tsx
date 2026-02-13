
import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from '../common/VideoPlayer';

import { API_BASE_URL } from '../../utils/api';

const DEFAULT_SENTENCE_VIDEO = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const SENTENCE_TOPIC_IMAGE = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80';

interface LessonSentence {
  id: number;
  lesson_id: number;
  sentence: string;
}

// --- Stopwords to filter out ---
const STOPWORDS = new Set([
  'and', 'or', 'but', 'is', 'am', 'are', 'was', 'were', 'has', 'have', 'had',
  'will', 'shall', 'a', 'an', 'the', 'to', 'of', 'for', 'from', 'in', 'on',
  'at', 'by', 'with', 'do', 'does', 'did'
]);

// --- Utility function to extract meaningful words ---
// Keep apostrophes within words (e.g., "let's" stays as a single token)
const extractMeaningfulWords = (sentence: string): string => {
  const words = sentence
    .toLowerCase()
    // Do NOT split on apostrophes; handle other delimiters
    .split(/[\s\-.,!?;:"()\[\]{}]+/)
    .filter((word) => word.length > 0 && !STOPWORDS.has(word));
  return words.join(' ');
};

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
  prerequisiteId?: string;
  topics: Topic[];
}

export interface AssessmentQuestion {
  id: string;
  videoUrl: string;
  options: string[];
  correctIdx: number;
}

const MOCK_ASSESSMENT: AssessmentQuestion[] = [
  {
    id: 'aq1',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    options: ['HELLO', 'THANK YOU', 'WELCOME', 'SORRY'],
    correctIdx: 0
  },
  {
    id: 'aq2',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    options: ['YES', 'NO', 'PLEASE', 'WATER'],
    correctIdx: 1
  },
  {
    id: 'aq3',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    options: ['FRIEND', 'FAMILY', 'MOTHER', 'FATHER'],
    correctIdx: 2
  },
  {
    id: 'aq4',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    options: ['SCHOOL', 'HOME', 'APPLE', 'FOOD'],
    correctIdx: 3
  },
  {
    id: 'aq5',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    options: ['WAIT', 'GO', 'STOP', 'AGAIN'],
    correctIdx: 0
  }
];

const LessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTopicIndex, setActiveTopicIndex] = useState<number | null>(null);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [lockedAlert, setLockedAlert] = useState<string | null>(null);
  const [showQuizGate, setShowQuizGate] = useState<number | null>(null);
  const [hoveredLessonId, setHoveredLessonId] = useState<string | null>(null);
  const [wordVideos, setWordVideos] = useState<any[]>([]);
  const [loadingWordVideos, setLoadingWordVideos] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [showingWordPreview, setShowingWordPreview] = useState<boolean>(true);
  const [lessonContentLoading, setLessonContentLoading] = useState<boolean>(false);
  const [lessonContentError, setLessonContentError] = useState<string | null>(null);

  // Assessment State
  const [isAssessing, setIsAssessing] = useState(false);
  const [currentAQIdx, setCurrentAQIdx] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [showAssessmentResult, setShowAssessmentResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const loadLessons = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/lessons`);
        const result = await response.json();

        if (!response.ok || !result.data) {
          throw new Error('Failed to fetch lessons');
        }

        // Map database lessons to component structure
        const lessonsData: Lesson[] = result.data.map((dbLesson: any, index: number) => ({
          id: String(dbLesson.id).padStart(2, '0'),
          title: dbLesson.title || `Lesson ${index + 1}`,
          description: `Initialize cognitive patterns for basic hand-shapes.`,
          status: index === 0 ? 'active' : index === 1 ? 'locked' : 'locked',
          difficulty: 'Basic' as const,
          duration: '15m',
          topics: (dbLesson.topics && dbLesson.topics.length > 0) 
            ? dbLesson.topics.map((topicItem: any, i: number) => ({
                id: `T${i + 1}`,
                title: topicItem.topic,
                type: 'Video' as const,
                duration: '3m',
                completed: i < 4,
                image: `https://images.unsplash.com/photo-${1516733968668 + i}-dbdce39c46ef?auto=format&fit=crop&q=80&w=400`,
                clips: (topicItem.sentences && topicItem.sentences.length > 0)
                  ? topicItem.sentences.map((sentenceItem: any, j: number) => ({
                      title: sentenceItem.sentence,
                      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                    }))
                  : [{ title: topicItem.topic, videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }]
              }))
            : []
        }));

        setLessons(lessonsData);
        console.log('✅ Lessons loaded from database:', lessonsData);
      } catch (error) {
        console.error('❌ Error loading lessons:', error);
        // Fallback to empty array
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (isAssessing && !showAssessmentResult && selectedOption === null) {
      setTimeLeft(15);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleOptionSelect(-1); // Auto-fail
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAssessing, currentAQIdx, showAssessmentResult, selectedOption]);

  // Autoplay word videos effect with preview
  useEffect(() => {
    if (wordVideos.length > 0 && currentWordIndex < wordVideos.length) {
      if (showingWordPreview) {
        // Show word preview for 2.5 seconds
        const previewTimer = setTimeout(() => {
          setShowingWordPreview(false);
        }, 2500);
        return () => clearTimeout(previewTimer);
      } else {
        // After video plays (approx 3.5 seconds), move to next word
        const videoTimer = setTimeout(() => {
          if (currentWordIndex < wordVideos.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
            setShowingWordPreview(true);
          } else {
            // All words finished, reset for next sentence
            setCurrentWordIndex(0);
            setShowingWordPreview(true);
          }
        }, 3500);
        return () => clearTimeout(videoTimer);
      }
    }
  }, [wordVideos, currentWordIndex, showingWordPreview]);

  const handleTopicClick = async (index: number) => {
    if (!selectedLesson) return;
    const blockIndex = Math.floor(index / 4);
    if (blockIndex > 0) {
      const allPrevCompleted = selectedLesson.topics.slice(0, blockIndex * 4).every(t => t.completed);
      if (!allPrevCompleted) {
        setLockedAlert(`NEURAL GATE ${blockIndex} PENDING`);
        setTimeout(() => setLockedAlert(null), 2000);
        return;
      }
    }
    
    setActiveTopicIndex(index);
    setActiveClipIndex(0);
    setCurrentWordIndex(0);
    setShowingWordPreview(true);

    // Fetch words for the first sentence of the topic
    const topic = selectedLesson.topics[index];
    if (topic.clips && topic.clips.length > 0) {
      const firstSentence = topic.clips[0].title;
      await fetchWordsForSentence(firstSentence);
    }
  };

  const buildLessonSentenceTopic = (lesson: Lesson, sentences: LessonSentence[]): Topic => ({
    id: `lesson-${lesson.id}-sentences`,
    title: `${lesson.title} Sentences`,
    type: 'Video',
    duration: `${Math.max(sentences.length, 1)}m`,
    completed: true,
    image: lesson.topics[0]?.image ?? SENTENCE_TOPIC_IMAGE,
    clips: sentences.map((sentenceRow) => ({
      id: String(sentenceRow.id),
      title: sentenceRow.sentence,
      videoUrl: DEFAULT_SENTENCE_VIDEO,
    })),
  });

  const handleLessonSelect = async (lesson: Lesson) => {
    setLessonContentError(null);
    setLessonContentLoading(true);
    try {
      const numericLessonId = Number(lesson.id);
      const lessonIdParam = Number.isNaN(numericLessonId) ? lesson.id : numericLessonId;
      const response = await fetch(`${API_BASE_URL}/lessons/${lessonIdParam}/sentences`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to load lesson sentences');
      }

      const sentences: LessonSentence[] = result.data || [];
      const sentenceTopic = buildLessonSentenceTopic(lesson, sentences);
      const enrichedLesson: Lesson = {
        ...lesson,
        topics: sentenceTopic.clips.length > 0 ? [sentenceTopic] : [],
      };

      setSelectedLesson(enrichedLesson);

      if (sentenceTopic.clips.length > 0) {
        setActiveTopicIndex(0);
        setActiveClipIndex(0);
        setCurrentWordIndex(0);
        setShowingWordPreview(true);
        await fetchWordsForSentence(sentenceTopic.clips[0].title);
      } else {
        setActiveTopicIndex(null);
        setWordVideos([]);
      }
    } catch (error) {
      console.error('❌ Error loading lesson sentences:', error);
      setLessonContentError('Unable to load lesson sentences right now. Please try again.');
      setSelectedLesson(null);
      setActiveTopicIndex(null);
    } finally {
      setLessonContentLoading(false);
    }
  };

  const resetLessonView = () => {
    setSelectedLesson(null);
    setActiveTopicIndex(null);
    setActiveClipIndex(0);
    setWordVideos([]);
    setCurrentWordIndex(0);
    setShowingWordPreview(true);
    setLessonContentError(null);
  };

  // Helper function to fetch words for a sentence
  const fetchWordsForSentence = async (sentence: string) => {
    // Keep apostrophes for display, but remove them for video lookup
    const displayWords = extractMeaningfulWords(sentence).split(/\s+/).filter((w) => w.length > 0);
    const meaningfulWords = displayWords.map((w) => w.replace(/['’]/g, ''));

    if (meaningfulWords.length === 0) {
      setWordVideos([]);
      return;
    }

    setLoadingWordVideos(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lessons/words/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: meaningfulWords })
      });
      const result = await response.json();
      if (result.success && result.data) {
        setWordVideos(result.data);
        console.log('✅ Fetched word videos:', result.data);
      }
    } catch (error) {
      console.error('❌ Error fetching word videos:', error);
    } finally {
      setLoadingWordVideos(false);
    }
  };

  const startAssessment = () => {
    setIsAssessing(true);
    setCurrentAQIdx(0);
    setAssessmentScore(0);
    setShowAssessmentResult(false);
    setSelectedOption(null);
    setTimeLeft(15);
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(idx);
    if (idx !== -1 && idx === MOCK_ASSESSMENT[currentAQIdx].correctIdx) {
      setAssessmentScore(s => s + 1);
    }
    setTimeout(() => {
      if (currentAQIdx < MOCK_ASSESSMENT.length - 1) {
        setCurrentAQIdx(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setShowAssessmentResult(true);
      }
    }, 1000);
  };

  const finalizeAssessment = () => {
    if (assessmentScore >= 4 && selectedLesson && showQuizGate !== null) {
      const updatedTopics = [...selectedLesson.topics];
      for (let i = showQuizGate - 4; i < showQuizGate; i++) {
        if (updatedTopics[i]) updatedTopics[i].completed = true;
      }
      setSelectedLesson({ ...selectedLesson, topics: updatedTopics });
    }
    setIsAssessing(false);
    setShowQuizGate(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin opacity-20"></div>
      <p className="text-[10px] font-black uppercase tracking-[1em] text-zinc-700">Syncing Schematic</p>
    </div>
  );

  if (selectedLesson && activeTopicIndex !== null) {
    const topic = selectedLesson.topics[activeTopicIndex];
    const clip = topic.clips[activeClipIndex];
    const totalClips = topic.clips.length;

    const handlePrevSentence = async () => {
      if (activeClipIndex > 0) {
        const newIndex = activeClipIndex - 1;
        setActiveClipIndex(newIndex);
        setCurrentWordIndex(0);
        setShowingWordPreview(true);
        
        // Fetch words for the new sentence
        const newSentence = topic.clips[newIndex].title;
        await fetchWordsForSentence(newSentence);
      }
    };

    const handleNextSentence = async () => {
      if (activeClipIndex < totalClips - 1) {
        const newIndex = activeClipIndex + 1;
        setActiveClipIndex(newIndex);
        setCurrentWordIndex(0);
        setShowingWordPreview(true);
        
        // Fetch words for the new sentence
        const newSentence = topic.clips[newIndex].title;
        await fetchWordsForSentence(newSentence);
      }
    };

    // Determine if we're showing word videos or sentence clips
    const showingWordVideos = wordVideos.length > 0;
    const currentData = showingWordVideos ? wordVideos[currentWordIndex] : clip;
    const displayVideoUrl = showingWordVideos ? currentData.video_url : currentData.videoUrl;
    const sentenceTitle = clip.title;

    return (
      <div className="min-h-screen bg-black text-white p-10 animate-in fade-in duration-500">
        <button onClick={resetLessonView} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all mb-10 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          DISCONNECT
        </button>
        <div className="max-w-lg mx-auto text-center space-y-10">
          <div className="w-full max-w-lg">
            {loadingWordVideos ? (
              <div className="w-full aspect-square flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin opacity-20 mx-auto"></div>
                  <p className="text-[10px] font-black uppercase tracking-[1em] text-zinc-700">Loading Words</p>
                </div>
              </div>
            ) : showingWordVideos && showingWordPreview ? (
              <div className="w-full aspect-square flex items-center justify-center animate-in fade-in duration-500">
                <div className="text-center">
                  <p className="text-7xl font-black italic uppercase tracking-tighter text-white animate-in fade-in duration-700">
                    {wordVideos[currentWordIndex]?.word}
                  </p>
                </div>
              </div>
            ) : (
              <VideoPlayer
                key={displayVideoUrl}
                src={displayVideoUrl}
                containerClassName="w-full aspect-square rounded-[3rem]"
                videoClassName=""
                autoPlay
                loop
                muted
                playsInline
                showControls={false}
                showPlayOverlay={false}
              />
            )}
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Sentence</p>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">{sentenceTitle}</h1>
              {showingWordVideos && (
                <p className="text-zinc-600 text-[11px] font-black uppercase tracking-widest mt-4">
                  Word {currentWordIndex + 1} / {wordVideos.length}
                </p>
              )}
            </div>
            <div className="space-y-2 border-t border-zinc-800 pt-6">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Key Words</p>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-300">{extractMeaningfulWords(sentenceTitle)}</h2>
            </div>
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={handlePrevSentence}
                disabled={activeClipIndex === 0}
                className={`py-3 px-6 rounded-full font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center ${
                  activeClipIndex === 0
                    ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                    : 'bg-white text-black hover:shadow-lg shadow-white/10'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 18.414L7.414 9.828 16 1.242v17.172z"/>
                </svg>
              </button>
              <span className="text-zinc-500 font-black uppercase text-[10px] tracking-widest min-w-[100px]">
                {activeClipIndex + 1} / {totalClips}
              </span>
              <button
                onClick={handleNextSentence}
                disabled={activeClipIndex === totalClips - 1}
                className={`py-3 px-6 rounded-full font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center ${
                  activeClipIndex === totalClips - 1
                    ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                    : 'bg-white text-black hover:shadow-lg shadow-white/10'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 1.414L16.586 10 8 18.586V1.414z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedLesson) return (
    <div className="w-full flex flex-col items-center justify-center py-12 font-['Plus_Jakarta_Sans']">
      <div className="z-10 w-full max-w-6xl mx-auto px-6 animate-in fade-in duration-700">
        <header className="py-20 border-b border-zinc-900 mb-12">
          <button onClick={() => setSelectedLesson(null)} className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-8 hover:text-white">← SCHEMATIC MAP</button>
          <h1 className="text-7xl font-black italic tracking-tighter uppercase">{selectedLesson.title}</h1>
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest mt-4">Module sequencing: 4 units per neural block.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto w-full">
        {selectedLesson.topics.map((topic, index) => {
          const blockIndex = Math.floor(index / 4);
          const isBlocked = blockIndex > 0 && !selectedLesson.topics.slice(0, blockIndex * 4).every(t => t.completed);
          const elements = [];

          if (index > 0 && index % 4 === 0) {
            elements.push(
              <div key={`gate-${index}`} className="col-span-full py-12 flex items-center justify-center relative">
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-zinc-900"></div>
                <button 
                  onClick={() => setShowQuizGate(index)}
                  className={`relative z-10 w-32 h-32 rounded-[2rem] border flex flex-col items-center justify-center gap-2 transition-all ${isBlocked ? 'bg-black border-zinc-900 text-zinc-800' : 'bg-white border-white text-black hover:scale-110 shadow-xl shadow-white/5'}`}
                  disabled={isBlocked}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                  <span className="text-[8px] font-black tracking-widest uppercase">GATE {index/4}</span>
                </button>
              </div>
            );
          }

          elements.push(
            <div 
              key={topic.id} 
              onClick={() => handleTopicClick(index)}
              className={`relative bg-[#080808] border rounded-[2.5rem] p-7 transition-all duration-500 cursor-pointer ${isBlocked ? 'opacity-30 border-zinc-900 grayscale pointer-events-none' : 'border-zinc-800 hover:border-white'}`}
            >
              <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-zinc-900">
                <img src={topic.image} className="w-full h-full object-cover grayscale opacity-30" />
              </div>
              <h3 className="text-lg font-black italic uppercase tracking-tight mb-1">{topic.title}</h3>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{topic.duration} Est.</p>
              <div className="mt-8 flex justify-between items-center">
                <div className={`w-2 h-2 rounded-full ${topic.completed ? 'bg-white shadow-[0_0_8px_white]' : 'bg-zinc-800'}`}></div>
                <span className="text-[7px] font-black text-zinc-700 uppercase">SYNCHRONIZED</span>
              </div>
            </div>
          );
          return elements;
        })}
      </div>

      {showQuizGate !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-xl animate-in fade-in duration-300 p-6">
          {!isAssessing ? (
            <div className="bg-[#080808] border border-zinc-900 max-w-lg w-full rounded-[3rem] p-12 text-center space-y-8">
              <div className="w-20 h-20 rounded-full border border-zinc-800 flex items-center justify-center mx-auto text-white">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Neural Validation</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] leading-loose">Pass the assessment (4/5) to unlock the next neural block.</p>
              <div className="flex flex-col gap-4">
                <button onClick={startAssessment} className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.4em] rounded-2xl text-[10px]">Initialize Assessment</button>
                <button onClick={() => setShowQuizGate(null)} className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">Abort</button>
              </div>
            </div>
          ) : showAssessmentResult ? (
            <div className="bg-[#080808] border border-zinc-900 max-w-lg w-full rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-500">
               <div className="text-6xl font-black italic mb-6">{assessmentScore}/5</div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{assessmentScore >= 4 ? 'SYNC GRANTED' : 'SYNC FAILED'}</h2>
               <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-10">{assessmentScore >= 4 ? 'Neural pathways optimized.' : 'Re-calibration required.'}</p>
               <button onClick={finalizeAssessment} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl">Finalize Sequence</button>
            </div>
          ) : (
            // REDUCED SIZE QUESTION BOX
            <div className="bg-[#080808] border border-zinc-900 max-w-2xl w-full rounded-[2.5rem] p-10 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-900">
                <div className="h-full bg-white shadow-[0_0_10px_white] transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
              </div>
              <div className="flex justify-between items-end mb-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Validation {currentAQIdx + 1}/5</p>
                  <p className={`text-xl font-black italic ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}S REMAINING</p>
                </div>
                <div className="flex gap-1.5">
                  {MOCK_ASSESSMENT.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentAQIdx ? 'w-10 bg-white' : i < currentAQIdx ? 'w-3 bg-zinc-600' : 'w-3 bg-zinc-900'}`}></div>
                  ))}
                </div>
              </div>
              <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-black border border-zinc-900 mb-8">
                <video key={MOCK_ASSESSMENT[currentAQIdx].videoUrl} autoPlay loop muted className="w-full h-full object-cover grayscale opacity-80">
                  <source src={MOCK_ASSESSMENT[currentAQIdx].videoUrl} type="video/mp4" />
                </video>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {MOCK_ASSESSMENT[currentAQIdx].options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleOptionSelect(i)}
                    className={`py-5 rounded-2xl border font-black text-[9px] uppercase tracking-widest transition-all ${selectedOption === i ? (i === MOCK_ASSESSMENT[currentAQIdx].correctIdx ? 'bg-white text-black border-white' : 'bg-zinc-900 text-red-500 border-red-900') : 'bg-black border-zinc-900 text-zinc-600 hover:border-zinc-400'}`}
                    disabled={selectedOption !== null}
                  >{opt}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {lockedAlert && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[110] bg-white text-black px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl animate-in slide-in-from-top-4">
          {lockedAlert}
        </div>
      )}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 font-['Plus_Jakarta_Sans']">
      <div className="z-10 w-full max-w-6xl mx-auto px-6">
        <div className="text-center space-y-8 mb-20">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[1em]">Cartography Index</p>
          <h1 className="text-7xl font-black italic tracking-tighter uppercase text-white">The Map</h1>
        </div>
        <div className="space-y-20">
          {lessons.map((l, index) => (
            <div 
              key={l.id} 
              className={`flex items-center gap-12 relative ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
            >
              <button 
                onClick={() => handleLessonSelect(l)} 
                disabled={lessonContentLoading}
                onMouseEnter={() => setHoveredLessonId(l.id)}
                onMouseLeave={() => setHoveredLessonId(null)}
                className={`group flex flex-col items-center gap-6 transition-all relative ${
                  l.status === 'active' ? 'scale-110' : ''
                }`}
              >
                <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all ${
                  l.status === 'active' 
                    ? 'bg-white text-black border-white shadow-[0_0_50px_rgba(255,255,255,0.2)]' 
                    : 'bg-black text-zinc-700 border-zinc-900 hover:border-zinc-600'
                }`}>
                  <span className="text-4xl font-black italic">{l.id}</span>
                </div>
                <p className={`text-[11px] font-black uppercase tracking-widest text-center ${
                  l.status === 'active' ? 'text-white' : 'text-zinc-700'
                }`}>{l.title}</p>

                {hoveredLessonId === l.id && (
                  <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-lg font-black text-[9px] uppercase tracking-widest whitespace-nowrap shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-20">
                    {l.status === 'completed' ? 'Revisit Module' : 'Initialize Module'}
                  </div>
                )}
              </button>
              
              {index < lessons.length - 1 && (
                <div className="flex-1 h-0.5 bg-gradient-to-r from-zinc-800 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {lessonContentLoading && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-t-2 border-white rounded-full animate-spin opacity-60 mx-auto"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.8em] text-zinc-500">Loading Lesson Sentences</p>
          </div>
        </div>
      )}

      {lessonContentError && (
        <div className="fixed bottom-6 right-6 z-[160] bg-white text-black px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl">
          {lessonContentError}
        </div>
      )}
    </div>
  );
};

export default LessonsPage;
