
import React, { useState, useEffect } from 'react';
import { getVocabulary, playPronunciation } from '../services/geminiService';

interface Card {
  id: string;
  content: string;
  type: 'english' | 'indonesian';
  matchId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const THEMES = [
  { id: 'animals', name: 'Animals', icon: '🐾' },
  { id: 'fruit', name: 'Fruit', icon: '🍎' },
  { id: 'classroom', name: 'Classroom', icon: '🏫' },
  { id: 'weather', name: 'Weather', icon: '☁️' }
];

interface MatchingIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

const MatchingIsland: React.FC<MatchingIslandProps> = ({ onBack, addPoints }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const initGame = async (theme: string) => {
    vibrate(10);
    setLoading(true);
    const vocab = await getVocabulary(theme);
    
    let gameCards: Card[] = [];
    vocab.forEach((v, idx) => {
      const matchId = `match-${idx}`;
      gameCards.push({
        id: `eng-${idx}`,
        content: v.english,
        type: 'english',
        matchId,
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: `idn-${idx}`,
        content: v.indonesian,
        type: 'indonesian',
        matchId,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle
    gameCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(gameCards);
    setFlippedCards([]);
    setMatches(0);
    setShowConfetti(false);
    setLoading(false);
  };

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length === 2) return;

    vibrate(15); // Quick tap haptic on flip
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    
    if (newCards[index].type === 'english') {
      playPronunciation(newCards[index].content);
    }

    setCards(newCards);
    setFlippedCards(prev => [...prev, index]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [idx1, idx2] = flippedCards;
      if (cards[idx1].matchId === cards[idx2].matchId) {
        // Match found
        vibrate([30, 50, 30]); // Success haptic
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[idx1].isMatched = true;
            next[idx2].isMatched = true;
            return next;
          });
          setMatches(m => {
            const newMatches = m + 1;
            addPoints(10, "Found a Match! 🧩");
            if (newMatches === cards.length / 2) {
              vibrate([100, 50, 100, 50, 100]); // Grand success haptic
              setShowConfetti(true);
              addPoints(50, "Cleared Matching Mayhem! 🏆");
            }
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        // Not a match
        vibrate([50, 100, 50]); // Error/No-match haptic
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[idx1].isFlipped = false;
            next[idx2].isFlipped = false;
            return next;
          });
          setFlippedCards([]);
        }, 1200);
      }
    }
  }, [flippedCards, cards]);

  return (
    <div className="max-w-4xl mx-auto p-6 relative overflow-hidden">
      {showConfetti && <div className="confetti-container"><ConfettiCannon /></div>}
      
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-blue-600 font-bold flex items-center gap-2">
          ⬅️ Back
        </button>
        {cards.length > 0 && (
          <div className="text-pink-600 font-bold bg-pink-50 px-4 py-2 rounded-full border border-pink-100">
            Matches: {matches} / {cards.length / 2}
          </div>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-pink-600 mb-4">Matching Mayhem! 🧩</h2>
          <p className="text-gray-600 mb-10">Choose a theme to start matching pairs!</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => initGame(theme.id)}
                disabled={loading}
                className="bg-white p-8 rounded-3xl shadow-xl hover:scale-105 transition-transform border-b-8 border-pink-200 group"
              >
                <div className="text-6xl mb-4 group-hover:rotate-12 transition-transform">{theme.icon}</div>
                <div className="font-bold text-xl text-gray-800">{theme.name}</div>
              </button>
            ))}
          </div>
          {loading && <p className="mt-8 text-xl animate-pulse text-pink-500">Preparing the magic... ✨</p>}
        </div>
      ) : (
        <div>
          {matches === cards.length / 2 ? (
            <div className="text-center p-12 bg-white rounded-3xl shadow-2xl animate-in zoom-in duration-500 border-4 border-pink-400">
              <span className="text-8xl mb-6 block animate-bounce">🏆</span>
              <h3 className="text-4xl font-bold text-pink-600 mb-4">Amazing Job!</h3>
              <p className="text-xl text-gray-600 mb-8">You matched all the words!</p>
              <button 
                onClick={() => { vibrate(10); setCards([]); }}
                className="bg-pink-500 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-pink-600 transition-all hover:scale-105"
              >
                Play Again!
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 perspective-1000">
              {cards.map((card, idx) => (
                <div 
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className={`relative aspect-square cursor-pointer transition-all duration-500 preserve-3d 
                    ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''} 
                    ${card.isMatched ? 'animate-match-flourish pointer-events-none' : ''}`}
                >
                  {/* Front (Hidden) */}
                  <div className="absolute inset-0 bg-pink-400 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center backface-hidden">
                    <span className="text-4xl text-white font-bold">?</span>
                  </div>
                  {/* Back (Visible) */}
                  <div className={`absolute inset-0 bg-white rounded-2xl border-4 shadow-lg flex items-center justify-center p-2 rotate-y-180 backface-hidden transition-colors ${card.isMatched ? 'border-green-400' : 'border-pink-400'}`}>
                    <span className={`text-center font-bold text-sm md:text-lg leading-tight ${card.type === 'english' ? 'text-pink-600' : 'text-blue-600'} ${card.isMatched ? 'text-green-600' : ''}`}>
                      {card.content}
                    </span>
                    {card.isMatched && <div className="absolute inset-0 bg-green-400/10 rounded-2xl animate-pulse" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .confetti-container { position: fixed; inset: 0; pointer-events: none; z-index: 100; }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #ffd300;
          top: -20px;
          animation: fall 3s linear infinite;
        }
        @keyframes fall {
          to { transform: translateY(100vh) rotate(360deg); }
        }

        @keyframes match-flourish {
          0% { transform: rotateY(180deg) scale(1); }
          30% { transform: rotateY(180deg) scale(1.15); border-color: #4ade80; box-shadow: 0 0 30px #4ade80; }
          60% { transform: rotateY(180deg) scale(1.1); opacity: 0.8; }
          100% { transform: rotateY(180deg) scale(0); opacity: 0; }
        }
        .animate-match-flourish {
          animation: match-flourish 1s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
};

const ConfettiCannon: React.FC = () => {
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <div 
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            width: `${5 + Math.random() * 10}px`,
            height: `${5 + Math.random() * 10}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0'
          }}
        />
      ))}
    </>
  );
};

export default MatchingIsland;
