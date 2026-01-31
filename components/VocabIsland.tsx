
import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import { getVocabulary, playPronunciation } from '../services/geminiService';

const CATEGORIES = [
  { id: 'animals', name: 'Animals', idn: 'Hewan', icon: '🐘' },
  { id: 'food', name: 'Food', idn: 'Makanan', icon: '🍕' },
  { id: 'colors', name: 'Colors', idn: 'Warna', icon: '🌈' },
  { id: 'hobbies', name: 'Hobbies', idn: 'Hobi', icon: '⚽' },
  { id: 'actions', name: 'Actions', idn: 'Tindakan', icon: '🏃' },
  { id: 'places', name: 'Places', idn: 'Tempat', icon: '🏘️' },
  { id: 'feelings', name: 'Feelings', idn: 'Perasaan', icon: '😊' }
];

interface VocabIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onWordLearned?: (word: string) => void;
}

const VocabIsland: React.FC<VocabIslandProps> = ({ onBack, addPoints, onWordLearned }) => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [viewedIndices, setViewedIndices] = useState<Set<number>>(new Set());

  const loadVocab = async (cat: string) => {
    setLoading(true);
    const data = await getVocabulary(cat);
    setCards(data);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewedIndices(new Set([0]));
    if (data.length > 0 && onWordLearned) onWordLearned(data[0].english);
    setLoading(false);
  };

  const handleSpeak = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSpeaking || !currentCard) return;
    
    setIsSpeaking(true);
    await playPronunciation(currentCard.english);
    setIsSpeaking(false);
  };

  const handleEmojiClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCount = spinCount + 1;
    if (newCount >= 3) {
      setIsSpinning(true);
      setSpinCount(0);
      setTimeout(() => setIsSpinning(false), 1000);
    } else {
      setSpinCount(newCount);
    }
  };

  useEffect(() => {
    if (isFlipped && cards.length > 0) {
      handleSpeak();
    }
  }, [isFlipped, currentIndex]);

  const handleNext = () => {
    const nextIdx = (currentIndex < cards.length - 1 ? currentIndex + 1 : 0);
    setCurrentIndex(nextIdx);
    setIsFlipped(false);
    
    if (onWordLearned && cards[nextIdx]) onWordLearned(cards[nextIdx].english);

    if (!viewedIndices.has(nextIdx)) {
      const nextViewed = new Set(viewedIndices).add(nextIdx);
      setViewedIndices(nextViewed);
      if (nextViewed.size === cards.length) {
        addPoints(50, "Completed a Vocabulary set! 📚");
      }
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-6 relative min-h-[70vh]">
      {/* Background Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="bubble bg-purple-200/40 rounded-full absolute bottom-[-50px]"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 60}px`,
              height: `${20 + Math.random() * 60}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <button onClick={onBack} className="mb-6 text-blue-600 font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
          ⬅️ Back to Map (Kembali)
        </button>

        {cards.length === 0 ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-purple-600 mb-8 animate-bounce-slow">Pick a Treasure Chest! 💎</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  disabled={loading}
                  onClick={() => loadVocab(cat.id)}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all border-b-8 border-purple-200 group active:scale-95"
                >
                  <div className="text-5xl mb-3 animate-character-breathe group-hover:scale-125 transition-transform">
                    <span className="animate-character-blink block">{cat.icon}</span>
                  </div>
                  <div className="font-bold text-xl group-hover:text-purple-600 transition-colors">{cat.name}</div>
                  <div className="text-gray-500 text-sm">{cat.idn}</div>
                </button>
              ))}
            </div>
            {loading && <div className="mt-12 flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-xl animate-pulse text-purple-600 font-bold">Summoning words... 🐻✨</p>
            </div>}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div 
              className={`w-full max-sm aspect-[3/4] cursor-pointer perspective-1000 group transition-all ${isSpinning ? 'animate-super-spin' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden border-8 border-purple-400">
                  <span 
                    className={`text-8xl mb-8 transition-transform active:scale-125 select-none animate-character-breathe ${spinCount > 0 ? 'scale-110' : ''}`}
                    onClick={handleEmojiClick}
                  >
                    <span className="animate-character-blink block">✨</span>
                  </span>
                  <h3 className="text-5xl font-black text-purple-600 text-center drop-shadow-sm">{currentCard.english}</h3>
                  <p className="mt-8 text-gray-400 animate-bounce">Click to Flip!</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 bg-purple-500 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 rotate-y-180 backface-hidden text-white border-8 border-white">
                  {currentCard.imageUrl && (
                    <div className="relative group">
                      <img 
                        src={currentCard.imageUrl} 
                        alt={currentCard.english} 
                        className="w-40 h-32 object-cover rounded-2xl mb-4 border-4 border-white/50 shadow-lg animate-in zoom-in duration-300 group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute -top-2 -right-2 text-2xl animate-pulse">🌟</div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-4xl font-bold">{currentCard.indonesian}</h3>
                    <button 
                      onClick={handleSpeak}
                      disabled={isSpeaking}
                      className={`bg-white/20 p-2 rounded-full hover:bg-white/40 transition-all ${isSpeaking ? 'animate-pulse scale-110 ring-4 ring-white/30' : ''}`}
                      title="Dengarkan pengucapan"
                    >
                      <span className="text-2xl">🔊</span>
                    </button>
                  </div>
                  <div className="w-12 h-1 bg-white/30 my-6 rounded-full"></div>
                  <p className="text-center text-xl italic font-medium leading-relaxed px-4 text-purple-50">
                    "{currentCard.example}"
                  </p>
                  <p className="mt-6 text-sm text-white/60 font-bold uppercase tracking-wider">Toby's Pronunciation 🐻</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-12 w-full max-w-sm">
              <button 
                onClick={() => {
                  const prevIdx = (currentIndex > 0 ? currentIndex - 1 : cards.length - 1);
                  setCurrentIndex(prevIdx);
                  setIsFlipped(false);
                  if (onWordLearned && cards[prevIdx]) onWordLearned(cards[prevIdx].english);
                }}
                className="flex-1 bg-white py-4 rounded-2xl shadow-md font-bold text-purple-600 border-2 border-purple-100 hover:bg-purple-50 active:scale-95 transition-all"
              >
                Previous
              </button>
              <button 
                onClick={handleNext}
                className="flex-1 bg-purple-600 py-4 rounded-2xl shadow-md font-bold text-white hover:bg-purple-700 active:scale-95 transition-all"
              >
                Next Word
              </button>
            </div>

            <button 
              onClick={() => setCards([])}
              className="mt-8 text-gray-500 underline hover:text-purple-600 font-bold"
            >
              Change Category
            </button>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        @keyframes super-spin {
          0% { transform: rotateY(0) rotateZ(0) scale(1); }
          50% { transform: rotateY(360deg) rotateZ(180deg) scale(1.1); }
          100% { transform: rotateY(720deg) rotateZ(360deg) scale(1); }
        }
        .animate-super-spin { animation: super-spin 1s cubic-bezier(0.4, 0, 0.2, 1); }
        
        @keyframes float-bubble {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        .bubble { animation: float-bubble 10s linear infinite; }
      `}</style>
    </div>
  );
};

export default VocabIsland;
