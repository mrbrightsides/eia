
import React, { useState, useEffect } from 'react';
import { getScrambleWords, playPronunciation } from '../services/geminiService';
import { ScrambleWord } from '../types';

interface ScrambleIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const ScrambleIsland: React.FC<ScrambleIslandProps> = ({ onBack, addPoints }) => {
  const [words, setWords] = useState<ScrambleWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [solved, setSolved] = useState(false);

  const initGame = async () => {
    vibrate(10);
    setLoading(true);
    const data = await getScrambleWords();
    setWords(data);
    setCurrentIndex(0);
    prepareWord(data[0]);
    setLoading(false);
  };

  const prepareWord = (item: ScrambleWord) => {
    if (!item) return;
    const chars = item.word.toUpperCase().split('');
    // Ensure it's actually scrambled
    let scrambledChars = [...chars].sort(() => Math.random() - 0.5);
    while (scrambledChars.join('') === item.word.toUpperCase() && item.word.length > 1) {
      scrambledChars = [...chars].sort(() => Math.random() - 0.5);
    }
    setScrambled(scrambledChars);
    setUserAnswer([]);
    setSolved(false);
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (solved) return;
    vibrate(15); // Letter select haptic
    setUserAnswer(prev => [...prev, letter]);
    const nextScrambled = [...scrambled];
    nextScrambled.splice(index, 1);
    setScrambled(nextScrambled);
  };

  const handleClear = (isManual: boolean = true) => {
    if (solved) return;
    if (isManual) vibrate([10, 50, 10]); // Reset haptic
    prepareWord(words[currentIndex]);
  };

  useEffect(() => {
    if (userAnswer.length > 0 && userAnswer.length === words[currentIndex]?.word.length) {
      if (userAnswer.join('') === words[currentIndex].word.toUpperCase()) {
        vibrate([30, 50, 30]); // Solved word haptic
        setSolved(true);
        playPronunciation(words[currentIndex].word);
        addPoints(25, "Unscrambled a word! 🌪️");
      } else {
        // Wrong answer feedback
        vibrate(100); // Error haptic
        const timer = setTimeout(() => handleClear(false), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [userAnswer, words, currentIndex]);

  const handleNext = () => {
    vibrate(20);
    const nextIdx = currentIndex + 1;
    if (nextIdx < words.length) {
      setCurrentIndex(nextIdx);
      prepareWord(words[nextIdx]);
    } else {
      vibrate([100, 50, 100]); // Final completion haptic
      addPoints(75, "Mastered the Scramble! 🎓");
      setWords([]); // Finished all
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center relative overflow-hidden">
      {solved && <div className="absolute inset-0 pointer-events-none z-0"><ConfettiBurst /></div>}
      
      <div className="w-full flex justify-between items-center mb-8 z-10">
        <button onClick={onBack} className="text-blue-600 font-bold flex items-center gap-2">
          ⬅️ Back
        </button>
        {words.length > 0 && (
          <div className="text-red-600 font-bold bg-red-50 px-4 py-2 rounded-full">
            Word {currentIndex + 1} / {words.length}
          </div>
        )}
      </div>

      {words.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-[40px] shadow-2xl border-b-8 border-red-200 max-w-lg z-10">
          <span className="text-8xl mb-6 block animate-character-breathe">
            <span className="animate-character-blink block">🌪️</span>
          </span>
          <h2 className="text-3xl font-black text-red-600 mb-4">Word Scramble!</h2>
          <p className="text-gray-600 mb-8">Can you fix the broken words? Toby needs your help!</p>
          <button 
            onClick={initGame}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "WINDY..." : "START MIXING! ✨"}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur p-10 rounded-[40px] shadow-2xl border-4 border-dashed border-red-200 relative overflow-hidden z-10">
          <div className="text-center mb-10">
            <span className="text-sm uppercase tracking-widest text-gray-400 font-bold">The Hint is:</span>
            <h3 className="text-4xl font-bold text-blue-600 mt-2">{words[currentIndex].hint}</h3>
          </div>

          {/* User Answer Area */}
          <div className="flex justify-center gap-2 mb-12 min-h-[80px]">
            {userAnswer.length === 0 && !solved && (
              <p className="text-gray-300 italic self-center">Click the letters below...</p>
            )}
            {userAnswer.map((char, i) => (
              <div 
                key={i} 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg border-2 border-b-4 animate-in zoom-in duration-300
                  ${solved ? 'bg-green-500 text-white border-green-600 scale-110' : 'bg-blue-600 text-white border-blue-700'}`}
              >
                {char}
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, words[currentIndex].word.length - userAnswer.length) }).map((_, i) => (
              <div key={i} className="w-14 h-14 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center" />
            ))}
          </div>

          {/* Scrambled Letters Pool */}
          {!solved && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {scrambled.map((char, i) => (
                <button
                  key={`${char}-${i}`}
                  onClick={() => handleLetterClick(char, i)}
                  className="w-16 h-16 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-3xl font-black border-2 border-b-4 border-red-200 shadow-md transition-all active:translate-y-1 active:border-b-0"
                >
                  {char}
                </button>
              ))}
            </div>
          )}

          {solved ? (
            <div className="text-center animate-in slide-in-from-bottom-5">
              <div className="text-green-600 font-black text-2xl mb-6">✨ EXCELLENT! ✨</div>
              <button 
                onClick={handleNext}
                className="bg-green-500 text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-xl hover:bg-green-600 transition-all hover:scale-105"
              >
                {currentIndex === words.length - 1 ? "Finish Game 🏆" : "Next Word ➡️"}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => handleClear(true)}
              className="mx-auto block text-gray-400 hover:text-red-500 font-bold transition-colors"
            >
              Reset 🔄
            </button>
          )}

          {/* Toby the helper with animations */}
          <div 
            className="absolute bottom-4 right-4 text-4xl opacity-50 grayscale hover:grayscale-0 transition-all cursor-help animate-character-breathe" 
            title="Need help?"
          >
            <span className="animate-character-blink block">🐻</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ConfettiBurst: React.FC = () => {
  const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div 
          key={i}
          className="absolute animate-burst"
          style={{
            left: '50%',
            top: '50%',
            width: '10px',
            height: '10px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            transform: `rotate(${Math.random() * 360}deg)`,
            '--tx': `${(Math.random() - 0.5) * 400}px`,
            '--ty': `${(Math.random() - 0.5) * 400}px`,
          } as any}
        />
      ))}
      <style>{`
        @keyframes burst {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity: 0; }
        }
        .animate-burst { animation: burst 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ScrambleIsland;
