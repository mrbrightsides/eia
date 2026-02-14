
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { playPronunciation, startChatSession } from '../services/geminiService';

interface PetIslandProps {
  onBack: () => void;
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  addPoints: (amount: number, reason: string) => void;
  updateMastery: () => void;
  unlockBadge?: (id: string) => void;
}

const STAGES = [
  { id: 'egg', name: 'Mysterious Egg', emoji: '🥚', minPoints: 0, color: 'bg-sky-400', bg: 'bg-sky-50', idn: 'Telur Misterius' },
  { id: 'baby', name: 'Baby Hatchling', emoji: '🐣', minPoints: 500, color: 'bg-green-400', bg: 'bg-green-50', idn: 'Anak Burung' },
  { id: 'junior', name: 'Junior Dragon', emoji: '🐉', minPoints: 2500, color: 'bg-purple-500', bg: 'bg-purple-50', idn: 'Naga Muda' },
  { id: 'master', name: 'Island Master', emoji: '🐲', minPoints: 5000, color: 'bg-yellow-500', bg: 'bg-yellow-50', idn: 'Penguasa Pulau' }
];

const PetIsland: React.FC<PetIslandProps> = ({ onBack, profile, onUpdateProfile, addPoints, updateMastery, unlockBadge }) => {
  const [eating, setEating] = useState(false);
  const [petDialogue, setPetDialogue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const points = parseInt(localStorage.getItem('userPoints') || '0');
  
  const currentStage = [...STAGES].reverse().find(s => points >= s.minPoints) || STAGES[0];
  const nextStage = STAGES[STAGES.indexOf(currentStage) + 1];
  
  const pantryWords = profile.learnedWords.filter(w => !profile.eatenWords?.includes(w));
  const chatRef = useRef<any>(null);

  useEffect(() => {
    // Check for "Dragon Master" badge
    if (currentStage.id === 'master' && unlockBadge) {
      unlockBadge('dragon_master');
    }

    // Initialize AI for Pet Dialogue
    chatRef.current = startChatSession(
      `You are Wordy, the user's magical pet ${currentStage.name}. ` +
      `User Points: ${points}. Stage: ${currentStage.id}. ` +
      `Words in pantry: ${pantryWords.length}. ` +
      `If words > 0, you are hungry and excited! Ask for food in cute English/Indonesian. ` +
      `If words == 0, you are sleepy and want the user to learn more words on Vocab Island. ` +
      `Keep it very short (1 sentence) and super cute.`
    );
    
    getInitialGreeting();
  }, [currentStage.id]);

  const getInitialGreeting = async () => {
    setIsTyping(true);
    try {
      const resp = await chatRef.current.sendMessage({ message: pantryWords.length > 0 ? "Hello! I'm hungry!" : "Hello! I'm sleepy!" });
      setPetDialogue(resp.text);
    } catch (e) {
      setPetDialogue(pantryWords.length > 0 ? "Ooh! I'm hungry for words! 🥯" : "I'm sleepy... Let's learn more words! 💤");
    } finally {
      setIsTyping(false);
    }
  };

  const feedWord = async (word: string) => {
    if (eating) return;
    setEating(true);
    
    // Update Profile
    const updatedEaten = [...(profile.eatenWords || []), word];
    const updatedProfile = { ...profile, eatenWords: updatedEaten };
    onUpdateProfile(updatedProfile);

    // Audio & Visual feedback
    await playPronunciation(`Yum! ${word}!`);
    addPoints(15, `Wordy loved "${word}"! 🥯`);
    updateMastery();

    // AI Reaction
    try {
      const resp = await chatRef.current.sendMessage({ message: `I just ate the word "${word}"! How was it?` });
      setPetDialogue(resp.text);
    } catch (e) {
      setPetDialogue(`That word "${word}" was delicious! ✨`);
    }

    setTimeout(() => {
      setEating(false);
    }, 2000);
  };

  const progressToNext = nextStage 
    ? ((points - currentStage.minPoints) / (nextStage.minPoints - currentStage.minPoints)) * 100 
    : 100;

  return (
    <div className={`min-h-[90vh] transition-colors duration-1000 ${currentStage.bg} p-6 flex flex-col items-center relative overflow-hidden`}>
      {/* Stage Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-wrap gap-20 p-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="text-6xl animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
            {currentStage.id === 'egg' ? '🪺' : currentStage.id === 'baby' ? '🌿' : currentStage.id === 'junior' ? '☁️' : '✨'}
          </span>
        ))}
      </div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <button onClick={onBack} className={`${currentStage.color} text-white px-6 py-2 rounded-full font-black shadow-lg hover:scale-105 transition-all`}>
            ⬅️ Back to Map
          </button>
          <div className="flex gap-2">
             <div className="bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-sky-100 flex items-center gap-2">
                <span className="text-orange-500 font-black">{profile.learnedWords.length}</span>
                <span className="text-[10px] text-gray-400 font-black uppercase">Words Found</span>
             </div>
             <div className="bg-white px-4 py-2 rounded-2xl shadow-md border-2 border-sky-100 flex items-center gap-2">
                <span className="text-green-500 font-black">{profile.eatenWords?.length || 0}</span>
                <span className="text-[10px] text-gray-400 font-black uppercase">Words Eaten</span>
             </div>
          </div>
        </div>

        <div className="bg-white w-full max-w-2xl p-12 rounded-[60px] shadow-2xl border-8 border-white text-center relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
             <div className={`${currentStage.color} text-white px-8 py-2 rounded-full font-black shadow-xl uppercase tracking-widest text-sm border-4 border-white`}>
                {currentStage.name}
             </div>
          </div>

          <div className="mb-12 relative group">
            <div className={`text-[180px] leading-none transition-all duration-700 select-none ${eating ? 'scale-125 rotate-12' : 'animate-character-breathe hover:scale-110'}`}>
               <span className="animate-character-blink block drop-shadow-2xl">{currentStage.emoji}</span>
            </div>
            {eating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl animate-ping-once">🥯</span>
              </div>
            )}
            {pantryWords.length === 0 && (
               <div className="absolute -top-4 right-1/4 bg-white p-3 rounded-2xl shadow-lg border-2 border-gray-100 animate-bounce">
                  <span className="text-2xl">💤</span>
               </div>
            )}
          </div>

          <div className="relative mb-10 min-h-[100px] flex items-center justify-center">
             <div className="bg-sky-50 p-6 rounded-[30px] border-4 border-sky-100 relative max-w-md">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-sky-50 border-t-4 border-l-4 border-sky-100 rotate-45"></div>
                {isTyping ? (
                   <div className="flex gap-1 justify-center">
                      <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                   </div>
                ) : (
                  <p className="text-sky-800 font-black text-xl italic leading-tight">
                    "{petDialogue || "..."}"
                  </p>
                )}
             </div>
          </div>

          <div className="w-full mb-10">
             <div className="flex justify-between items-end mb-2">
                <div className="text-left">
                   <div className="text-[10px] font-black text-gray-400 uppercase">Growth Progress</div>
                   <div className="text-lg font-black text-sky-600">{Math.round(progressToNext)}%</div>
                </div>
                {nextStage && (
                  <div className="text-right">
                     <div className="text-[10px] font-black text-gray-400 uppercase">Next: {nextStage.name}</div>
                     <div className="text-xs font-bold text-orange-400">{nextStage.minPoints - points} points to go</div>
                  </div>
                )}
             </div>
             <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-50 shadow-inner">
                <div 
                  className={`h-full ${currentStage.color} transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)]`}
                  style={{ width: `${progressToNext}%` }}
                >
                   <div className="w-full h-full bg-white/20 animate-pulse" />
                </div>
             </div>
          </div>

          <div className="bg-sky-50/50 p-8 rounded-[40px] border-4 border-dashed border-sky-200 shadow-inner">
             <h3 className="text-sm font-black text-sky-400 uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
               <span className="text-xl">🧺</span> Your Word Pantry
             </h3>
             <div className="flex flex-wrap justify-center gap-3">
               {pantryWords.length === 0 ? (
                 <div className="flex flex-col items-center p-4">
                    <p className="text-gray-400 font-bold italic mb-4">Your pantry is empty!</p>
                    <button onClick={onBack} className="bg-sky-500 text-white px-8 py-3 rounded-full font-black shadow-lg hover:scale-105 transition-all">
                       FIND MORE WORDS! 🔎
                    </button>
                 </div>
               ) : (
                 pantryWords.map(word => (
                   <button 
                     key={word}
                     onClick={() => feedWord(word)}
                     disabled={eating}
                     className="bg-white px-6 py-3 rounded-2xl border-2 border-sky-100 font-black text-sky-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all active:scale-90 shadow-md group relative overflow-hidden"
                   >
                     <span className="relative z-10">{word}</span>
                     <div className="absolute inset-0 bg-sky-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                   </button>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        .animate-ping-once { animation: ping-once 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PetIsland;
