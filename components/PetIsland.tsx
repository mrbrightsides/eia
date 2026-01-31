
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { playPronunciation } from '../services/geminiService';

interface PetIslandProps {
  onBack: () => void;
  profile: UserProfile;
  addPoints: (amount: number, reason: string) => void;
  updateMastery: () => void;
}

const PetIsland: React.FC<PetIslandProps> = ({ onBack, profile, addPoints, updateMastery }) => {
  const [eating, setEating] = useState(false);
  const [msg, setMsg] = useState("");

  const getPetEmoji = () => {
    const points = parseInt(localStorage.getItem('userPoints') || '0');
    if (points >= 5000) return '🐲';
    if (points >= 2500) return '🐉';
    if (points >= 500) return '🐣';
    return '🥚';
  };

  const feedWord = async (word: string) => {
    if (eating) return;
    setEating(true);
    setMsg(`Yum! I love the word "${word}"!`);
    await playPronunciation(`Yum! ${word}!`);
    addPoints(5, "Feeding Wordy! 🥯");
    updateMastery();
    setTimeout(() => {
      setEating(false);
      setMsg("");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center min-h-[70vh]">
      <button onClick={onBack} className="self-start text-sky-600 font-bold mb-8 flex items-center gap-2">
        ⬅️ Back to Map
      </button>

      <div className="bg-white w-full max-w-2xl p-10 rounded-[60px] shadow-2xl border-8 border-sky-100 text-center relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/green-dust.png')]">
        <div className="absolute top-10 right-10 text-4xl animate-pulse">🌳</div>
        <div className="absolute bottom-10 left-10 text-4xl animate-bounce">🌻</div>

        <div className="mb-10 relative">
          <div className={`text-9xl transition-all duration-500 ${eating ? 'scale-125 rotate-6' : 'animate-character-breathe'}`}>
            <span className="animate-character-blink block">{getPetEmoji()}</span>
          </div>
          {eating && <div className="absolute top-0 right-0 text-5xl animate-bounce">🍪</div>}
        </div>

        <h2 className="text-4xl font-black text-sky-600 mb-2 uppercase tracking-tight">Wordy's Nest</h2>
        <p className="text-gray-500 font-bold mb-8 italic">Feed Wordy the words you've learned to help him grow!</p>

        {msg && (
          <div className="mb-8 p-4 bg-sky-50 rounded-2xl border-2 border-sky-200 text-sky-700 font-black text-xl animate-in zoom-in duration-300">
            {msg}
          </div>
        )}

        <div className="bg-sky-50/50 p-6 rounded-[40px] border-4 border-dashed border-sky-200">
           <h3 className="text-sm font-black text-sky-400 uppercase tracking-widest mb-4">Your Word Pantry</h3>
           <div className="flex flex-wrap justify-center gap-3">
             {profile.learnedWords.length === 0 ? (
               <div className="text-gray-400 p-8 italic">Your pantry is empty! Go learn words on Vocab Island.</div>
             ) : (
               profile.learnedWords.map(word => (
                 <button 
                   key={word}
                   onClick={() => feedWord(word)}
                   className="bg-white px-6 py-2 rounded-full border-2 border-sky-200 font-bold text-sky-600 hover:bg-sky-500 hover:text-white hover:border-sky-600 transition-all active:scale-90 shadow-sm"
                 >
                   {word}
                 </button>
               ))
             )}
           </div>
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
           <div className="text-left">
              <div className="text-[10px] font-black text-gray-400 uppercase">Growth Stage</div>
              <div className="font-black text-sky-600">
                {parseInt(localStorage.getItem('userPoints') || '0') < 500 ? 'EGG' : 'BABY'}
              </div>
           </div>
           <div className="text-right">
              <div className="text-[10px] font-black text-gray-400 uppercase">Next Stage In</div>
              <div className="font-black text-orange-500">
                {Math.max(0, 500 - parseInt(localStorage.getItem('userPoints') || '0'))} pts
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PetIsland;
