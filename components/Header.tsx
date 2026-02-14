
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  points: number;
  streak: number;
  level: number;
  rank: string;
  progress: number;
  avatar: string;
  petEmoji: string;
  onProfileClick: () => void;
  onPetClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ points, streak, level, rank, progress, avatar, petEmoji, onProfileClick, onPetClick }) => {
  const [clicks, setClicks] = useState(0);
  const [rainbowMode, setRainbowMode] = useState(false);
  const [animatePoints, setAnimatePoints] = useState(false);
  const [showStreakTooltip, setShowStreakTooltip] = useState(false);

  useEffect(() => {
    setAnimatePoints(true);
    const timer = setTimeout(() => setAnimatePoints(false), 500);
    return () => clearTimeout(timer);
  }, [points]);

  const handleLogoClick = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 7) {
      setRainbowMode(!rainbowMode);
      setClicks(0);
    }
  };

  // Milestone Progress (Days 1 to 7)
  const milestoneProgress = streak % 7 === 0 && streak > 0 ? 7 : streak % 7;

  return (
    <header className="bg-white shadow-md flex flex-col sticky top-0 z-50 overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
          <div className={`bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:rotate-12 ${rainbowMode ? 'animate-spin-slow' : ''}`}>
            🏝️
          </div>
          <div>
            <h1 className={`text-2xl font-bold leading-none transition-colors duration-500 ${rainbowMode ? 'rainbow-text' : 'text-blue-600'}`}>
              English Island
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">LV {level}</span>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{rank}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 sm:gap-4 items-center">
          <button 
            onClick={onPetClick}
            className="bg-sky-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-sky-100 shadow-sm hover:bg-sky-100 transition-colors hidden sm:flex"
          >
            <span className="text-xl animate-character-breathe">
              <span className="animate-character-blink block">{petEmoji}</span>
            </span>
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-tight">Wordy</span>
          </button>

          {streak > 0 && (
            <div 
              className="relative group flex items-center gap-1 bg-gradient-to-br from-orange-400 to-red-500 text-white px-4 py-1.5 rounded-full font-black text-sm border-2 border-white shadow-lg cursor-help transition-all hover:scale-105 active:scale-95 overflow-hidden"
              onMouseEnter={() => setShowStreakTooltip(true)}
              onMouseLeave={() => setShowStreakTooltip(false)}
              onClick={() => setShowStreakTooltip(!showStreakTooltip)}
            >
              {/* Inner Glow/Pulse */}
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              
              <span className="animate-character-breathe relative z-10">🔥</span>
              <span className="relative z-10">{streak}</span>

              {/* Weekly Milestone Progress Dots */}
              <div className="flex gap-0.5 ml-1 relative z-10">
                {[...Array(7)].map((_, i) => (
                   <div 
                    key={i} 
                    className={`w-1 h-1 rounded-full ${i < milestoneProgress ? 'bg-white shadow-[0_0_5px_white]' : 'bg-white/30'}`} 
                   />
                ))}
              </div>

              {/* Tooltip */}
              {showStreakTooltip && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-3 py-2 rounded-xl w-32 shadow-2xl animate-in fade-in zoom-in duration-200 z-50 pointer-events-none">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  <p className="font-black uppercase tracking-widest mb-1 text-orange-400">Streak Power!</p>
                  <p className="font-bold opacity-80">{7 - milestoneProgress} days until Super Bonus!</p>
                </div>
              )}
            </div>
          )}

          <div className={`flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold transition-transform duration-500 shadow-sm border border-green-200 ${animatePoints ? 'scale-110' : 'scale-100'}`}>
            <span className="text-xl animate-character-breathe">⭐</span>
            <span className="text-lg">{points}</span>
          </div>

          <button 
            onClick={onProfileClick}
            className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm hover:bg-blue-200 hover:scale-105 transition-all border-2 border-white"
          >
            <span className="animate-character-breathe">
              <span className="animate-character-blink block">{avatar}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="h-2 w-full bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-1000 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute top-0 right-0 w-1 h-full bg-white/50 animate-pulse" />
        </div>
      </div>

      <style>{`
        @keyframes rainbow-anim { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        .rainbow-text {
          background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);
          -webkit-background-clip: text;
          color: transparent;
          background-size: 400% 400%;
          animation: rainbow-anim 2s linear infinite;
        }
      `}</style>
    </header>
  );
};

export default Header;
