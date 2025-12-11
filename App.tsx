import React, { useState, useEffect } from 'react';
import { BIBLE_BOOKS } from './constants';
import { SefariaResponse, WordData } from './types';
import WordBreakdownPanel from './components/WordBreakdownPanel';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon, 
  ClockIcon, 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

type PanelId = 'nav' | 'reader' | 'decoder';

const WHISPER_WORDS = [
  'RIGHTEOUSNESS', 'יהוה', 'GRACE', 'CHILD OF GOD', 'ישוע', 
  'ANOINTED', 'ROYALTY', 'רוּחַ הַקּוֹדֶשׁ', 'CHOSEN', 'אֱמֶת', 
  'FAVOR', 'שלום'
];

const App: React.FC = () => {
  // Navigation State (Input fields)
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState('');
  
  // Active State (What is currently displayed on screen)
  const [activeRef, setActiveRef] = useState({ 
    book: 'Genesis', 
    chapter: 1, 
    verse: null as number | null 
  });

  const [loading, setLoading] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  
  // Data State
  const [scriptureData, setScriptureData] = useState<SefariaResponse | null>(null);
  const [history, setHistory] = useState<WordData[]>([]);
  const [historyFilter, setHistoryFilter] = useState('');
  
  // Interaction State
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [journalNote, setJournalNote] = useState('');
  
  // Layout State
  const [maximizedPanel, setMaximizedPanel] = useState<PanelId | null>(null);
  const [activeMobilePanel, setActiveMobilePanel] = useState<PanelId>('reader');

  // Whisper State
  const [whisperData, setWhisperData] = useState<{ 
    word: string; 
    key: number; 
    top: number; 
    left: number; 
  }>({ 
    word: WHISPER_WORDS[0], 
    key: 0, 
    top: 50, 
    left: 20 
  });

  // Initial Load
  useEffect(() => {
    fetchScripture();
  }, []);

  // Whisper Animation Loop
  useEffect(() => {
    if (!showLanding) return;
    
    const interval = setInterval(() => {
      const randomWord = WHISPER_WORDS[Math.floor(Math.random() * WHISPER_WORDS.length)];
      
      // Calculate random position
      // Vertical: 20% to 80% to avoid extreme top/bottom
      const randomTop = Math.floor(Math.random() * 60) + 20;
      
      // Horizontal: Avoid center (35%-65%). 
      // Left Zone: 15% - 35%
      // Right Zone: 65% - 85%
      const isRight = Math.random() > 0.5;
      const randomLeft = isRight 
        ? Math.floor(Math.random() * 20) + 65 
        : Math.floor(Math.random() * 20) + 15;

      setWhisperData(prev => ({ 
        word: randomWord, 
        key: prev.key + 1, 
        top: randomTop, 
        left: randomLeft 
      }));
    }, 6000); // 6 Seconds

    return () => clearInterval(interval);
  }, [showLanding]);

  const fetchScripture = async () => {
    setLoading(true);
    setScriptureData(null); 
    
    // Capture current inputs for the active state
    const currentBook = selectedBook;
    const currentChapter = selectedChapter;
    const currentVerse = selectedVerse ? parseInt(selectedVerse) : null;

    try {
      // Build URL: Book.Chapter or Book.Chapter.Verse
      const versePart = currentVerse ? `.${currentVerse}` : '';
      const response = await fetch(`https://www.sefaria.org/api/texts/${currentBook}.${currentChapter}${versePart}?context=0&version=King%20James%20Version`);
      const data = await response.json();
      
      setScriptureData(data);
      
      // Only update the active reference display if fetch succeeds
      setActiveRef({
        book: currentBook,
        chapter: currentChapter,
        verse: currentVerse
      });

    } catch (error) {
      console.error("Failed to fetch scripture", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = (word: string, verseIndex: number) => {
    // Strip punctuation for key
    const clean = word.replace(/[^\u0590-\u05FF]/g, '').replace(/[\u0591-\u05C7]/g, '');
    const newWordData = { text: word, cleanText: clean, verseIndex };
    
    setSelectedWord(newWordData);
    
    // Switch to decoder on mobile when clicked
    setActiveMobilePanel('decoder');
    
    setHistory(prev => {
      if (prev.length > 0 && prev[0].cleanText === clean) return prev;
      return [newWordData, ...prev].slice(0, 10);
    });

    const savedNote = localStorage.getItem(`rhema_notes_${clean}`);
    setJournalNote(savedNote || '');
  };

  const handleNoteChange = (val: string) => {
    setJournalNote(val);
    if (selectedWord) {
      localStorage.setItem(`rhema_notes_${selectedWord.cleanText}`, val);
    }
  };

  const toggleMaximize = (panel: PanelId) => {
    if (maximizedPanel === panel) {
      setMaximizedPanel(null);
    } else {
      setMaximizedPanel(panel);
    }
  };

  const renderHebrewVerse = (text: string, verseIndex: number) => {
    if (!text) return null;
    const words = text.split(' ');
    return (
      <div className="flex flex-wrap flex-row-reverse gap-2 leading-loose text-2xl md:text-3xl hebrew-text py-2">
        {words.map((word, idx) => {
            const raw = word.replace(/<[^>]*>?/gm, '');
            if (!raw) return null;
            return (
              <span 
                key={idx}
                onClick={() => handleWordClick(raw, verseIndex)}
                className={`
                  cursor-pointer transition-all duration-300 rounded px-1.5 py-0.5
                  hover:text-[#00d2ff] hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(0,210,255,0.6)]
                  ${selectedWord?.text === raw ? 'text-[#00d2ff] font-bold drop-shadow-[0_0_20px_rgba(59,0,255,0.8)]' : 'text-slate-100'}
                `}
              >
                {raw}
              </span>
            );
        })}
      </div>
    );
  };

  // Helper to determine panel visibility class
  const getPanelClass = (id: PanelId) => {
    // Mobile Logic
    const isMobileHidden = activeMobilePanel !== id ? 'hidden md:flex' : 'flex';
    
    // Desktop Maximize Logic
    if (maximizedPanel) {
      return maximizedPanel === id 
        ? 'flex col-span-12 row-span-1 md:col-span-12 z-50 absolute inset-0 bg-[#090a20] p-6' // Fullscreen
        : 'hidden'; // Hide others
    }

    // Default Grid
    let gridClass = '';
    if (id === 'nav') gridClass = 'md:col-span-3 lg:col-span-2';
    if (id === 'reader') gridClass = 'md:col-span-6 lg:col-span-7';
    if (id === 'decoder') gridClass = 'md:col-span-3 lg:col-span-3';

    // Using h-[100dvh] for mobile wrapper ensures we take available space properly
    return `${isMobileHidden} ${gridClass} flex-col glass-panel rounded-none md:rounded-3xl overflow-hidden transition-all duration-500 h-full md:h-auto border-x-0 md:border-x`;
  };

  // --- LANDING PAGE ---
  if (showLanding) {
    const isHebrew = /[\u0590-\u05FF]/.test(whisperData.word);

    return (
      <div className="h-[100dvh] w-full cosmic-bg flex flex-col items-center justify-center relative overflow-hidden p-4">
        {/* Deep Space Nebula Background (Handled by CSS .cosmic-bg) */}
        
        {/* Whispers Background Text */}
        <div 
          key={whisperData.key} 
          className="whisper-text"
          style={{
            top: `${whisperData.top}%`,
            left: `${whisperData.left}%`,
          }}
        >
          <span className={`
            ${isHebrew ? 'hebrew-text text-6xl md:text-9xl' : 'cinzel-font text-4xl md:text-8xl tracking-[0.5em]'}
          `}>
            {whisperData.word}
          </span>
        </div>

        {/* 3D Animated Cross */}
        <div className="scene-3d mb-8 md:mb-12 relative z-10">
          <div className="cross-object">
            <div className="beam beam-v"></div>
            <div className="beam beam-h"></div>
          </div>
        </div>

        {/* Typography */}
        <div className="text-center z-10 space-y-4">
          <h1 className="cinzel-font text-4xl md:text-7xl text-white font-bold tracking-widest cyan-glow">
            GENESIS
          </h1>
          <p className="tech-font text-[#a0a8c0] text-xs md:text-sm tracking-[0.5em] uppercase opacity-80">
            Study Suite <span className="text-[#00d2ff] mx-2">///</span> V3.0
          </p>
        </div>

        {/* Reactor Button */}
        <button 
          onClick={() => setShowLanding(false)}
          className="mt-16 md:mt-20 reactor-button px-10 md:px-16 py-4 md:py-5 rounded-full text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-white relative z-10"
        >
          Start Decoding
        </button>
      </div>
    );
  }

  // --- RENDERING HELPERS FOR READER ---
  // Ensure we always work with arrays, even if Sefaria returns a single string for a single verse
  const hebrewVerses = scriptureData ? (Array.isArray(scriptureData.he) ? scriptureData.he : [scriptureData.he]) : [];
  const englishVerses = scriptureData ? (Array.isArray(scriptureData.text) ? scriptureData.text : [scriptureData.text]) : [];

  // --- MAIN APP ---
  return (
    <div className="h-[100dvh] w-full cosmic-bg text-[#a0a8c0] overflow-hidden flex flex-col p-0 md:p-6 gap-0 md:gap-6 relative">
      
      {/* Main Grid Container */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 relative max-w-[1920px] mx-auto w-full h-full">
        
        {/* --- PANEL 1: NAV --- */}
        <section className={getPanelClass('nav')}>
           <div className="p-4 md:p-5 border-b border-[#3b00ff]/20 flex justify-between items-center bg-[#3b00ff]/5">
              <h2 className="cinzel-font text-[#00d2ff] tracking-widest text-xs font-bold flex items-center gap-2">
                <Bars3Icon className="w-4 h-4" /> Codex
              </h2>
              <button onClick={() => toggleMaximize('nav')} className="text-[#a0a8c0] hover:text-[#00d2ff] transition-colors">
                {maximizedPanel === 'nav' ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
              </button>
           </div>
           
           {/* Added pb-24 for mobile nav clearance */}
           <div className="p-4 md:p-6 flex-grow overflow-y-auto space-y-8 pb-24 md:pb-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-[#00d2ff] tracking-wider font-semibold ml-2">Book</label>
                  <div className="relative">
                    <select 
                      value={selectedBook}
                      onChange={(e) => setSelectedBook(e.target.value)}
                      className="w-full appearance-none glass-pill px-5 py-3 text-sm cursor-pointer"
                    >
                      {BIBLE_BOOKS.map(b => <option key={b} value={b} className="bg-[#090a20] text-slate-200">{b}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#00d2ff]">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-[#00d2ff] tracking-wider font-semibold ml-2">Chapter</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(parseInt(e.target.value) || 1)}
                      className="w-full glass-pill px-5 py-3 text-sm text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-[#00d2ff] tracking-wider font-semibold ml-2">Verse</label>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="All"
                      value={selectedVerse}
                      onChange={(e) => setSelectedVerse(e.target.value)}
                      className="w-full glass-pill px-5 py-3 text-sm text-center placeholder:text-[#a0a8c0]/30"
                    />
                  </div>
                </div>

                <button 
                  onClick={fetchScripture}
                  disabled={loading}
                  className="w-full electric-gradient py-3 rounded-full text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? <span className="animate-spin">⟳</span> : <MagnifyingGlassIcon className="w-4 h-4" />}
                  Load Scripture
                </button>
              </div>

              <div className="pt-6 border-t border-[#3b00ff]/20">
                <label className="text-[10px] uppercase text-[#a0a8c0] tracking-wider font-semibold flex items-center gap-2 mb-4 ml-2">
                  <ClockIcon className="w-3 h-3 text-[#00d2ff]" /> Recent Study
                </label>
                
                {/* History Search Filter */}
                <div className="relative mb-4">
                  <input 
                    type="text" 
                    placeholder="Filter history..."
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className="w-full glass-pill px-4 py-2 text-xs placeholder:text-[#a0a8c0]/30 pr-8 bg-[#090a20]/60 border-[#3b00ff]/20 focus:border-[#00d2ff]/40 text-right hebrew-text direction-rtl"
                    dir="auto"
                  />
                  <MagnifyingGlassIcon className="w-3 h-3 text-[#a0a8c0] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="space-y-2">
                  {history
                    .filter(h => h.cleanText.includes(historyFilter))
                    .map((h, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedWord(h)}
                      className="flex justify-between items-center group cursor-pointer p-3 rounded-xl hover:bg-[#3b00ff]/10 transition-colors border border-transparent hover:border-[#3b00ff]/30"
                    >
                      <span className="hebrew-text text-lg text-[#a0a8c0] group-hover:text-[#00d2ff] transition-colors">{h.cleanText}</span>
                      <span className="text-[10px] text-[#00d2ff] font-mono">Vs.{h.verseIndex + 1}</span>
                    </div>
                  ))}
                  {history.length > 0 && history.filter(h => h.cleanText.includes(historyFilter)).length === 0 && (
                     <div className="text-center text-[10px] text-[#a0a8c0]/50 py-4 italic">No matches found</div>
                  )}
                </div>
              </div>
           </div>
        </section>

        {/* --- PANEL 2: READER --- */}
        <section className={getPanelClass('reader')}>
           <div className="p-4 md:p-5 border-b border-[#3b00ff]/20 flex justify-between items-center bg-[#3b00ff]/5 z-10">
              <h2 className="cinzel-font text-[#00d2ff] tracking-widest text-xs font-bold flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4" /> Scripture
              </h2>
              <button onClick={() => toggleMaximize('reader')} className="text-[#a0a8c0] hover:text-[#00d2ff] transition-colors">
                {maximizedPanel === 'reader' ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 md:p-12 relative">
              {/* Top/Bottom Fade Gradients */}
              <div className="fixed top-[60px] left-0 right-0 h-10 bg-gradient-to-b from-[#090a20] to-transparent pointer-events-none md:hidden"></div>

              {loading && (
                 <div className="h-full flex flex-col items-center justify-center gap-6">
                   <div className="w-16 h-16 border-2 border-[#00d2ff] border-t-transparent rounded-full animate-spin"></div>
                   <span className="tech-font text-xs uppercase tracking-[0.3em] text-[#00d2ff] animate-pulse">Receiving Transmission...</span>
                 </div>
              )}

              {!scriptureData && !loading && (
                 <div className="h-full flex flex-col items-center justify-center text-[#a0a8c0] opacity-50">
                   <BookOpenIcon className="w-20 h-20 mb-6 stroke-1 text-[#3b00ff]" />
                   <p className="tech-font text-sm uppercase tracking-[0.2em]">Select text to begin</p>
                 </div>
              )}

              {scriptureData && !loading && (
                <div className="max-w-4xl mx-auto space-y-16 animate-fadeIn pb-32">
                  <div className="text-center">
                    <h2 className="text-2xl md:text-6xl font-normal text-white mb-4 cinzel-font tracking-widest cyan-glow">
                      {activeRef.book} 
                      <span className="text-[#3b00ff] ml-3">
                        {activeRef.chapter}{activeRef.verse ? `:${activeRef.verse}` : ''}
                      </span>
                    </h2>
                    <div className="h-[1px] w-32 md:w-48 bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent mx-auto opacity-70"></div>
                  </div>

                  <div className="space-y-6 md:space-y-8">
                    {hebrewVerses.map((verse, idx) => (
                      <div key={idx} className="group relative p-4 md:p-8 border border-white/0 hover:border-[#00d2ff]/20 hover:bg-[#3b00ff]/5 transition-all duration-500 rounded-2xl">
                         {/* Verse Number Logic */}
                         <span className="absolute left-2 md:left-4 top-4 md:top-6 text-[10px] text-[#00d2ff] font-mono select-none px-2 py-1 rounded-md bg-[#3b00ff]/10">
                           {activeRef.verse ? activeRef.verse : idx + 1}
                         </span>
                         
                         {/* English Text - Updated Typography */}
                         <p className="text-[#a0a8c0] text-sm md:text-lg font-light font-sans leading-loose mb-6 pl-8 md:pl-10 group-hover:text-white transition-colors">
                           {englishVerses[idx]?.replace(/<[^>]*>?/gm, '')}
                         </p>

                         {/* Hebrew Text */}
                         <div className="text-right border-t border-[#3b00ff]/20 pt-4" dir="rtl">
                           {renderHebrewVerse(verse, activeRef.verse ? activeRef.verse - 1 : idx)}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </section>

        {/* --- PANEL 3: DECODER --- */}
        <section className={getPanelClass('decoder')}>
           <div className="p-4 md:p-5 border-b border-[#3b00ff]/20 flex justify-between items-center bg-[#3b00ff]/5">
              <h2 className="cinzel-font text-[#00d2ff] tracking-widest text-xs font-bold flex items-center gap-2">
                <MagnifyingGlassIcon className="w-4 h-4" /> Rhema Scope
              </h2>
              <button onClick={() => toggleMaximize('decoder')} className="text-[#a0a8c0] hover:text-[#00d2ff] transition-colors">
                {maximizedPanel === 'decoder' ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
              </button>
           </div>
           
           {/* Added pb-24 for mobile nav clearance via the internal component styles if needed, or primarily here on container */}
           <div className="p-4 md:p-6 flex-grow overflow-hidden flex flex-col pb-24 md:pb-6">
              <WordBreakdownPanel 
                selectedWord={selectedWord}
                journalNote={journalNote}
                onNoteChange={handleNoteChange}
                bookName={activeRef.book}
                chapter={activeRef.chapter}
              />
           </div>
        </section>

      </div>

      {/* Mobile Bottom Navigation (Visible only < 768px) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 glass-panel rounded-full flex justify-around items-center z-50 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl bg-[#090a20]/90">
        <button 
          onClick={() => setActiveMobilePanel('nav')} 
          className={`flex flex-col items-center gap-1 transition-colors ${activeMobilePanel === 'nav' ? 'text-[#00d2ff]' : 'text-[#a0a8c0]'}`}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveMobilePanel('reader')} 
          className={`flex flex-col items-center gap-1 transition-colors ${activeMobilePanel === 'reader' ? 'text-[#00d2ff]' : 'text-[#a0a8c0]'}`}
        >
          <BookOpenIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveMobilePanel('decoder')} 
          className={`flex flex-col items-center gap-1 transition-colors ${activeMobilePanel === 'decoder' ? 'text-[#00d2ff]' : 'text-[#a0a8c0]'}`}
        >
          <MagnifyingGlassIcon className="w-6 h-6" />
        </button>
      </nav>

    </div>
  );
};

export default App;