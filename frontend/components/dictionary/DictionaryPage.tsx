
import React, { useState, useMemo, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';

interface LexiconItem {
  id: string;
  word: string;
  category: string;
  videoUrl: string;
}

const DictionaryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<LexiconItem | null>(null);
  const [items, setItems] = useState<LexiconItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isModalOpen = Boolean(selectedItem);

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/words`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: LexiconItem[] = json.data.map((w: any) => ({
            id: String(w.id),
            word: (w.word || '').toUpperCase(),
            category: 'LEXICON',
            videoUrl: w.video_url,
          }));
          setItems(mapped);
        } else {
          setItems([]);
        }
      } catch (e) {
        console.error('❌ Failed to fetch dictionary words:', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

  const filteredData = useMemo(() => {
    return items.filter(item => 
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, items]);

  const closeModal = () => setSelectedItem(null);

  return (
    <div className="relative">
      <div className={`space-y-10 animate-in fade-in duration-700 pb-20 transition-all ${isModalOpen ? 'blur-[2px] scale-[0.99] pointer-events-none' : ''}`}>
      <header className="space-y-2 border-b border-zinc-900 pb-10">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Neural Lexicon Index</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">Dictionary</h1>
        
        <div className="max-w-md mt-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-zinc-600 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="SEARCH PROTOCOL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080808] border border-zinc-900 rounded-2xl py-4 pl-14 pr-6 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-800"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin opacity-20"></div>
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em]">Syncing Lexicon</p>
        </div>
      ) : filteredData.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredData.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-[#080808] border border-zinc-900 rounded-2xl p-6 text-left hover:border-zinc-500 hover:-translate-y-1 transition-all group relative overflow-hidden active:scale-95"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14m-7-7 7 7-7 7"/>
                 </svg>
              </div>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{item.category}</p>
              <h3 className="text-xl font-black tracking-tighter text-white uppercase italic">{item.word}</h3>
              <div className="mt-4 flex items-center gap-2">
                 <div className="w-1 h-1 bg-zinc-800 rounded-full group-hover:bg-white transition-colors"></div>
                 <span className="text-[7px] font-black text-zinc-800 group-hover:text-zinc-500 uppercase tracking-widest">Visual available</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
           <div className="w-20 h-20 bg-zinc-950 border border-zinc-900 rounded-3xl flex items-center justify-center grayscale opacity-20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                 <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
           </div>
           <div>
             <h2 className="text-xl font-black text-zinc-500 uppercase italic">Entry Not Found</h2>
             <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">Recalibrate search parameters</p>
           </div>
        </div>
      )}

      </div>

      {/* Video Modal Popup */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/80 backdrop-blur-3xl" 
             onClick={closeModal}
           ></div>
           
           {/* Modal Content */}
           <div className="relative w-full max-w-3xl bg-[#080808] border border-zinc-900 rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.04)] flex flex-col animate-in zoom-in-95 duration-500">
             <div className="p-5 md:p-6 flex justify-between items-center border-b border-zinc-900">
                <div>
                   <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-1">{selectedItem.category}</p>
                   <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">{selectedItem.word}</h2>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 transition-all active:scale-90"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
             </div>

             <div className="flex-1 bg-black flex items-center justify-center p-3 md:p-4">
               <div className="w-full max-w-[34rem] aspect-square relative group rounded-[2.5rem] overflow-hidden border border-zinc-900">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover opacity-100 transition-all duration-700 rounded-[2.5rem]"
                >
                  <source src={selectedItem.videoUrl} type="video/mp4" />
                </video>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[8px] font-black bg-white text-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-2xl">4K Visual Stream</span>
                </div>
               </div>
             </div>

             <div className="p-5 md:p-6 bg-zinc-950/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-zinc-500 text-sm md:text-base font-medium max-w-lg italic">
                  "Visual interpretation of {selectedItem.word}. Focus on the spatial hand-shape and axial rotation."
                </p>
                <button className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest active:scale-95 shadow-lg">
                  Add to Practice
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryPage;
