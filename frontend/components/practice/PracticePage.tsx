
import React, { useState, useEffect } from 'react';
import VideoPlayer from '../common/VideoPlayer';
import { API_BASE_URL } from '../../utils/api';

// Reuse similar stopword and word extraction logic as Lessons page
const STOPWORDS = new Set([
  'and', 'or', 'but', 'is', 'am', 'are', 'was', 'were', 'has', 'have', 'had',
  'will', 'shall', 'a', 'an', 'the', 'to', 'of', 'for', 'from', 'in', 'on',
  'at', 'by', 'with', 'do', 'does', 'did'
]);

const extractMeaningfulWords = (sentence: string): string[] => {
  const words = sentence
    .toLowerCase()
    .split(/[\s\-.,!?;:"()\[\]{}]+/)
    .filter((word) => word.length > 0 && !STOPWORDS.has(word));
  return words;
};

interface Question {
  id: string;
  text: string;
  videoUrl: string; // Mandatory for visual assessment
  options: string[];
  correctAnswer: number;
}

interface PracticeLesson {
  id: string;
  title: string;
  status: 'completed' | 'active' | 'locked';
  difficulty: string;
  questions: Question[];
}

const PracticePage: React.FC = () => {
  const [lessons, setLessons] = useState<PracticeLesson[]>([]);
  const [lessonOptions, setLessonOptions] = useState<{ id: string; title: string; photo?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<PracticeLesson | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/lessons`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const list = json.data.map((l: any) => ({
            id: String(l.id),
            title: l.title || `Lesson ${String(l.id).padStart(2, '0')}`,
            photo: l.photo_url || undefined,
          }));
          setLessonOptions(list);
        } else {
          setLessonOptions([]);
        }
      } catch (e) {
        console.error('❌ Failed to fetch lessons:', e);
        setLessonOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  const startLessonPractice = async (lessonOption: { id: string; title: string }) => {
    try {
      setLoading(true);

      // 1. Fetch sentences for this lesson
      const resSent = await fetch(`${API_BASE_URL}/lessons/${lessonOption.id}/sentences`);
      const jsonSent = await resSent.json();

      if (!jsonSent.success || !Array.isArray(jsonSent.data) || jsonSent.data.length === 0) {
        setLoading(false);
        return;
      }

      const sentences: string[] = jsonSent.data.map((s: any) => s.sentence as string);

      // 2. Extract unique meaningful words from all sentences
      const wordSet = new Set<string>();
      for (const sentence of sentences) {
        const tokens = extractMeaningfulWords(sentence);
        for (const t of tokens) {
          if (t.trim().length === 0) continue;
          // Normalize for lookup by stripping apostrophes
          const normalized = t.replace(/['’]/g, '');
          if (normalized.length > 0) {
            wordSet.add(normalized);
          }
        }
      }

      const words = Array.from(wordSet);
      if (words.length === 0) {
        setLoading(false);
        return;
      }

      // 3. Fetch available word videos (filters to only existing words)
      const resVideos = await fetch(`${API_BASE_URL}/lessons/words/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words }),
      });
      const jsonVideos = await resVideos.json();

      if (!jsonVideos.success || !Array.isArray(jsonVideos.data) || jsonVideos.data.length === 0) {
        setLoading(false);
        return;
      }

      const availableWords: { word: string; video_url: string }[] = jsonVideos.data;

      // 4. Randomly select 10 words (or all if less than 10)
      const shuffledWords = [...availableWords].sort(() => Math.random() - 0.5);
      const selectedWords = shuffledWords.slice(0, Math.min(10, shuffledWords.length));

      // 5. For each selected word, fetch distractor options and build questions
      const questions: Question[] = [];

      for (const bw of selectedWords) {
        try {
          const resOpts = await fetch(`${API_BASE_URL}/words/options`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: bw.word, count: 3 }),
          });
          const jsonOpts = await resOpts.json();

          let distractors: string[] = [];
          if (jsonOpts.success && jsonOpts.data && Array.isArray(jsonOpts.data.distractors)) {
            distractors = jsonOpts.data.distractors;
          }

          const optionWords = [bw.word, ...distractors].slice(0, 4);

          // Shuffle options and track correct index
          const shuffled = [...optionWords];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          const correctIndex = shuffled.findIndex((w) => w === bw.word);

          if (correctIndex === -1) continue;

          questions.push({
            id: `w-${bw.word}`,
            text: 'Which word does this sign represent?',
            videoUrl: bw.video_url,
            options: shuffled,
            correctAnswer: correctIndex,
          });
        } catch (e) {
          console.error('❌ Failed to build options for word', bw.word, e);
        }
      }

      if (questions.length === 0) {
        setLoading(false);
        return;
      }

      const lesson: PracticeLesson = {
        id: lessonOption.id,
        title: lessonOption.title,
        status: 'active',
        difficulty: 'Basic',
        questions,
      };

      setLessons([lesson]);
      startQuiz(lesson);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (lesson: PracticeLesson) => {
    if (lesson.status === 'locked' || lesson.questions.length === 0) return;
    setActiveQuiz(lesson);
    setCurrentQuestionIdx(0);
    setScore(0);
    setShowResult(false);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === activeQuiz!.questions[currentQuestionIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < activeQuiz!.questions.length - 1) {
      setCurrentQuestionIdx(idx => idx + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-t-2 border-white rounded-full animate-spin opacity-20"></div>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600">Retrieving Logs</p>
      </div>
    );
  }

  if (activeQuiz && !showResult) {
    const q = activeQuiz.questions[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100;

    return (
      <div className="max-w-[1200px] mx-auto pt-2 pb-6 animate-in fade-in zoom-in-95 duration-500">
        <header className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{activeQuiz.title}</h2>
          </div>
          <div className="text-right">
            <div className="w-24 h-1 bg-zinc-900 rounded-full mb-2 overflow-hidden">
              <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Protocol: {currentQuestionIdx + 1}/{activeQuiz.questions.length}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <div className="w-full rounded-[2rem] overflow-hidden bg-zinc-950 border-2 border-zinc-900 shadow-xl ring-1 ring-white/5">
              <VideoPlayer
                key={q.videoUrl}
                src={q.videoUrl}
                containerClassName="w-full aspect-square"
                videoClassName="object-cover opacity-100 transition-all duration-700"
                autoPlay
                loop
                muted
                playsInline
                showControls={false}
                showPlayOverlay={false}
              />
            </div>
            <div className="p-5 bg-[#0a0a0a] border border-zinc-900 rounded-2xl">
               <h3 className="text-xl font-bold leading-tight text-white mb-2">{q.text}</h3>
               <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest italic">Observe and identify gesture mapping.</p>
            </div>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleOptionSelect(i)}
                className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 text-sm font-bold flex justify-between items-center group
                  ${isAnswered ? 
                    (i === q.correctAnswer ? 'bg-white text-black border-white shadow-lg' : 
                     (i === selectedOption ? 'bg-zinc-900 border-red-900 text-zinc-500 opacity-50' : 'bg-black border-zinc-900 text-zinc-700 opacity-30'))
                    : 'bg-zinc-950 border-zinc-900 hover:border-zinc-500 hover:bg-zinc-900 hover:translate-x-1'}`}
              >
                <div className="flex items-center gap-4">
                   <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-black uppercase ${isAnswered && i === q.correctAnswer ? 'bg-black text-white border-zinc-800' : 'border-zinc-800 text-zinc-600'}`}>
                      {String.fromCharCode(65 + i)}
                   </span>
                   <span>{opt}</span>
                </div>
                {isAnswered && i === q.correctAnswer && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="animate-in zoom-in duration-300">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                )}
              </button>
            ))}

            {isAnswered && (
              <button 
                onClick={nextQuestion}
                className="w-full mt-4 py-4 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-4 text-[10px]"
              >
                {currentQuestionIdx < activeQuiz.questions.length - 1 ? "Next Protocol" : "Finalize"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / activeQuiz!.questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-black text-2xl font-black shadow-xl">
            {percentage}%
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Assessment Complete</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#080808] border border-zinc-900 p-6 rounded-2xl text-left">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Accuracy</p>
            <p className="text-2xl font-black">{score} / {activeQuiz!.questions.length}</p>
          </div>
          <div className="bg-[#080808] border border-zinc-900 p-6 rounded-2xl text-left">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status</p>
            <p className="text-2xl font-black uppercase italic">{percentage >= 70 ? 'VALID' : 'RETRY'}</p>
          </div>
        </div>

        <button 
          onClick={() => { setActiveQuiz(null); setShowResult(false); }}
          className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.01] transition-all text-[10px]"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="space-y-1">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">SIMULATION ENVIRONMENT</p>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Practice Center</h1>
        <p className="text-zinc-500 text-lg max-w-xl leading-tight font-medium">Browse all lessons directly from the registry.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonOptions.map((lessonOption) => (
          <div 
            key={lessonOption.id}
            className="group relative p-8 rounded-[2rem] border transition-all duration-500 bg-[#080808] border-zinc-800 hover:border-zinc-500 hover:-translate-y-1"
          >
            <div className="w-full h-32 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 flex items-center justify-center text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 overflow-hidden">
              {lessonOption.photo ? (
                <img src={lessonOption.photo} alt={lessonOption.title} className="w-full h-full object-cover" />
              ) : (
                <span>Photo</span>
              )}
            </div>
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">{lessonOption.title}</h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Lesson</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">ID {lessonOption.id}</span>
              <button 
                className="py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] bg-white text-black hover:scale-[1.01] shadow-lg"
                onClick={() => startLessonPractice(lessonOption)}
              >
                Practice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticePage;
