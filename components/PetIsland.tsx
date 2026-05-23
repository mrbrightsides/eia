
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [petting, setPetting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<number>(() => {
    const saved = localStorage.getItem('petLastInteraction');
    return saved ? parseInt(saved, 10) : Date.now();
  });
  const [happiness, setHappiness] = useState(() => {
    const saved = localStorage.getItem('petHappiness');
    return saved ? parseInt(saved, 10) : 50;
  });
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
      `Happiness: ${happiness}%. ` +
      `Words in pantry: ${pantryWords.length}. ` +
      `If words > 0, you are hungry and excited! Ask for food in cute English/Indonesian. ` +
      `If words == 0, you are sleepy and want the user to learn more words on Vocab Island. ` +
      `If happiness is high, you are super energetic! If low, you are a bit sad and want pets. ` +
      `Keep it very short (1 sentence) and super cute.`
    );
    
    getInitialGreeting();
  }, [currentStage.id]);

  useEffect(() => {
    localStorage.setItem('petHappiness', happiness.toString());
  }, [happiness]);

  useEffect(() => {
    localStorage.setItem('petLastInteraction', lastInteraction.toString());
  }, [lastInteraction]);

  const updateInteraction = () => {
    setLastInteraction(Date.now());
  };

  const getMood = () => {
    const diff = (Date.now() - lastInteraction) / (1000 * 60); // minutes
    if (diff < 30) return { label: 'Happy', emoji: '✨', color: 'text-yellow-400' };
    if (diff < 120) return { label: 'Idle', emoji: '💤', color: 'text-blue-300' };
    return { label: 'Lonely', emoji: '🥺', color: 'text-gray-400' };
  };

  const currentMood = getMood();

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
    updateInteraction();

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

  const handlePet = async () => {
    if (petting || eating) return;
    setPetting(true);
    updateInteraction();
    setHappiness(prev => Math.min(prev + 10, 100));
    
    addPoints(5, "Wordy loved the pets! ❤️");
    
    try {
      const resp = await chatRef.current.sendMessage({ message: "I'm being petted! I love it!" });
      setPetDialogue(resp.text);
    } catch (e) {
      setPetDialogue("That feels so good! Purrr... ✨");
    }

    setTimeout(() => {
      setPetting(false);
    }, 1000);
  };

  const handlePlay = async () => {
    if (playing || eating || petting) return;
    setPlaying(true);
    updateInteraction();
    setHappiness(prev => Math.min(prev + 15, 100));
    
    addPoints(10, "Wordy had so much fun playing! ⚽");
    
    try {
      const resp = await chatRef.current.sendMessage({ message: "We are playing a game! I'm jumping for joy!" });
      setPetDialogue(resp.text);
    } catch (e) {
      setPetDialogue("Wheee! This is fun! 🌈");
    }

    setTimeout(() => {
      setPlaying(false);
    }, 1500);
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
            <motion.div 
              onClick={handlePet}
              animate={petting ? {
                scale: [1, 1.2, 1.1],
                rotate: [0, 10, -10, 0],
              } : eating ? {
                scale: [1, 1.25, 1],
                rotate: [0, 12, 0],
              } : playing ? {
                y: [0, -50, 0, -30, 0],
                rotate: [0, 0, 360, 360, 360],
              } : {
                y: [0, -10, 0],
              }}
              transition={petting || eating || playing ? { duration: playing ? 1.5 : 0.5 } : {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`text-[180px] leading-none transition-all duration-700 select-none cursor-pointer drop-shadow-2xl relative`}
            >
               <span className="animate-character-blink block">{currentStage.emoji}</span>
               
               {/* Mood Badge */}
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute top-0 right-0 bg-white w-16 h-16 rounded-full shadow-lg border-4 border-sky-50 flex items-center justify-center text-3xl"
               >
                 {currentMood.emoji}
               </motion.div>
            </motion.div>
            
            <AnimatePresence>
              {petting && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1.5, y: -100 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <span className="text-6xl">❤️</span>
                </motion.div>
              )}
              {eating && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 2 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <span className="text-7xl">🥯</span>
                </motion.div>
              )}
              {playing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1.5, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <span className="text-6xl">⚽</span>
                </motion.div>
              )}
            </AnimatePresence>

            {pantryWords.length === 0 && !petting && !eating && (
               <div className="absolute -top-4 right-1/4 bg-white p-3 rounded-2xl shadow-lg border-2 border-gray-100 animate-bounce">
                  <span className="text-2xl">💤</span>
               </div>
            )}
            
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest whitespace-nowrap">
              Click to pet Wordy!
            </div>
          </div>

          <div className="w-full mb-6">
             <div className="flex justify-between items-end mb-1">
                <div className="text-[10px] font-black text-gray-400 uppercase">Happiness</div>
                <div className="text-xs font-black text-rose-500">{happiness}%</div>
             </div>
             <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${happiness}%` }}
                  className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
                />
             </div>
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
                <div className="flex gap-4">
                  <button 
                    onClick={handlePet}
                    disabled={petting || eating || playing}
                    className="bg-rose-100 p-3 rounded-2xl border-2 border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm"
                    title="Pet Wordy"
                  >
                    👋
                  </button>
                  <button 
                    onClick={handlePlay}
                    disabled={petting || eating || playing}
                    className="bg-amber-100 p-3 rounded-2xl border-2 border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white transition-all active:scale-90 shadow-sm"
                    title="Play with Wordy"
                  >
                    ⚽
                  </button>
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
                 pantryWords.map((word, i) => (
                   <button 
                     key={`${word}-${i}`}
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
