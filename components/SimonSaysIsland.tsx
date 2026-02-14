
import React, { useState, useEffect } from 'react';
import { getSimonCommands, playPronunciation } from '../services/geminiService';

interface SimonSaysIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

const ACTIONS = [
  { id: 'CLAP', icon: '👏', label: 'Clap' },
  { id: 'JUMP', icon: '🏃', label: 'Jump' },
  { id: 'WAVE', icon: '👋', label: 'Wave' },
  { id: 'TOUCH NOSE', icon: '👃', label: 'Touch Nose' },
  { id: 'SMILE', icon: '😊', label: 'Smile' }
];

const SimonSaysIsland: React.FC<SimonSaysIslandProps> = ({ onBack, addPoints }) => {
  const [commands, setCommands] = useState<{ text: string, action: string, simonSays: boolean }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    setLoading(true);
    try {
      const data = await getSimonCommands();
      setCommands(data);
      setGameState('playing');
      setCurrentIdx(0);
      setFeedback(null);
    } catch (e) {
      alert("Simon is busy! Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (actionId: string) => {
    if (gameState !== 'playing') return;

    const command = commands[currentIdx];
    const isCorrect = command.simonSays ? command.action === actionId : false;

    if (command.simonSays) {
      if (command.action === actionId) {
        setFeedback("Correct! Toby is happy! ✅");
        addPoints(10, "Simon said correctly!");
      } else {
        setFeedback("Oops! Simon said " + command.action + "! ❌");
      }
    } else {
      setFeedback("Oh no! Toby didn't say 'Simon Says'! ❌");
    }

    proceed();
  };

  // If user clicks nothing and Toby didn't say Simon Says, they are correct
  const handlePass = () => {
     if (gameState !== 'playing') return;
     const command = commands[currentIdx];
     if (!command.simonSays) {
        setFeedback("Great! Toby didn't say Simon Says! ✅");
        addPoints(10, "Smart listening!");
     } else {
        setFeedback("Oops! You should have " + command.action + "! ❌");
     }
     proceed();
  };

  const proceed = () => {
    setTimeout(() => {
      if (currentIdx < commands.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setFeedback(null);
      } else {
        setGameState('result');
      }
    }, 1500);
  };

  useEffect(() => {
    if (gameState === 'playing' && commands[currentIdx]) {
      playPronunciation(commands[currentIdx].text);
    }
  }, [currentIdx, gameState]);

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
      <button onClick={onBack} className="self-start text-yellow-600 font-bold mb-8">⬅️ Back to Map</button>

      <div className="bg-white w-full max-w-2xl p-10 rounded-[50px] shadow-2xl border-8 border-yellow-100 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">📢</div>
        
        {gameState === 'lobby' && (
          <div className="animate-in fade-in py-10">
            <div className="text-8xl mb-6 animate-character-breathe">🐻</div>
            <h2 className="text-4xl font-black text-yellow-600 mb-4 uppercase">Simon Says!</h2>
            <p className="text-gray-500 font-bold mb-10 max-w-sm mx-auto">
              Only do what Toby says IF he starts with "Simon Says"!
              <br/><span className="text-xs opacity-60">(Hanya lakukan jika diawali "Simon Says")</span>
            </p>
            <button 
              onClick={startGame}
              disabled={loading}
              className="bg-yellow-500 text-white px-12 py-5 rounded-[30px] font-black text-2xl shadow-xl hover:bg-yellow-600 transition-all active:scale-95"
            >
              {loading ? "PREPARING..." : "LET'S PLAY! 🎮"}
            </button>
          </div>
        )}

        {gameState === 'playing' && commands[currentIdx] && (
          <div className="animate-in slide-in-from-right duration-300">
             <div className="flex justify-center mb-8 relative">
                <div className="w-32 h-32 bg-yellow-50 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-yellow-100">
                  <span className="animate-character-breathe block">🐻</span>
                </div>
                {feedback && (
                  <div className="absolute -top-10 bg-white px-6 py-2 rounded-2xl shadow-xl border-4 border-yellow-200 font-black text-yellow-600 animate-in zoom-in">
                    {feedback}
                  </div>
                )}
             </div>

             <div className="bg-yellow-50 p-8 rounded-[40px] mb-10 border-4 border-dashed border-yellow-200">
                <div className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-2">Toby says:</div>
                <h3 className="text-4xl font-black text-yellow-700 leading-tight">"{commands[currentIdx].text}"</h3>
             </div>

             <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
                {ACTIONS.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    disabled={!!feedback}
                    className="flex flex-col items-center gap-2 p-4 bg-white border-4 border-yellow-50 rounded-3xl hover:border-yellow-400 hover:bg-yellow-50 transition-all active:scale-90 shadow-sm disabled:opacity-50"
                  >
                    <span className="text-4xl">{action.icon}</span>
                    <span className="text-[10px] font-black uppercase text-yellow-600">{action.label}</span>
                  </button>
                ))}
             </div>

             <button 
               onClick={handlePass}
               disabled={!!feedback}
               className="w-full bg-gray-100 text-gray-500 py-4 rounded-[30px] font-black hover:bg-gray-200 transition-all"
             >
                DO NOTHING (PASS) 🤫
             </button>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in duration-500 py-10 text-center">
            <div className="text-8xl mb-6">🏆</div>
            <h2 className="text-4xl font-black text-yellow-600 mb-2">Game Over!</h2>
            <p className="text-xl font-bold text-gray-500 mb-8">Great listening skills! You earned points for Toby!</p>
            <button 
              onClick={() => setGameState('lobby')}
              className="bg-yellow-500 text-white px-10 py-5 rounded-3xl font-black text-xl shadow-lg hover:bg-yellow-600 active:scale-95"
            >
              PLAY AGAIN! 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimonSaysIsland;
