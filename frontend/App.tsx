
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import AuthPage from './components/auth/AuthPage';
import AccountPage from './components/account/AccountPage';
import OnboardingCarousel from './components/auth/OnboardingCarousel';
import SplashPage from './components/auth/SplashPage';
import LessonsPage from './components/lessons/LessonsPage';
import UserPreferences from './components/auth/UserPreferences';
import PracticePage from './components/practice/PracticePage';
import DictionaryPage from './components/dictionary/DictionaryPage';
import GamesPage from './components/games/GamesPage';

// Layout for pages that include the sidebar
const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const desktopShiftClass = sidebarOpen 
    ? 'lg:ml-64 lg:w-[calc(100%_-_16rem)]' 
    : 'lg:ml-0 lg:w-full';

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-['Plus_Jakarta_Sans'] relative">
      
      {/* 
        Persistent Toggle Button (Visible only when sidebar is closed) 
        Aligned with the start of the slimmer sidebar branding
      */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-[5.5rem] left-8 z-[60] w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center shadow-2xl active:scale-90 transition-all border border-zinc-200 animate-in fade-in zoom-in duration-300"
          title="Open Sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar with visibility props and internal toggle */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content with adaptive spacing matching slimmer sidebar (w-64) */}
      <main 
        className={`flex-1 overflow-y-auto custom-scrollbar px-6 md:px-14 py-8 md:py-12 scroll-smooth pt-24 lg:pt-12 transition-all duration-500 ${desktopShiftClass}`}
      >
        <div className={`max-w-[1400px] mx-auto transition-all duration-500`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/onboarding" element={<OnboardingCarousel />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/preferences" element={<UserPreferences />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings" element={
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-500">
               <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-900/50 rounded-[2.5rem] md:rounded-[3rem] border border-zinc-800 flex items-center justify-center">
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1">
                   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                 </svg>
               </div>
               <div>
                 <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white uppercase italic text-zinc-200">System Locked</h2>
                 <p className="text-zinc-600 mt-4 text-lg md:text-xl font-medium tracking-wide italic">"Access restricted to core modules only."</p>
               </div>
            </div>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
