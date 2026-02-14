
import React, { useState, useEffect } from 'react';
import { getISpyScene, generateQuestImage, playPronunciation } from '../services/geminiService';

interface ISpyIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

const ISpyIsland: React.FC<ISpyIslandProps> = ({ onBack, addPoints }) => {
  const [scene, setScene] = useState<{ riddle: string, idnRiddle: string, answer: string } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<{ status: 'correct' | 'wrong', msg: string } | null>(null);

  const loadNewRiddle = async () => {
    setLoading(true);
    setScene(null);
    setImageUrl(null);
    setFeedback(null);
    setUserInput("");
    try {
      const data = await getISpyScene();
      setScene(data);
      const img = await generateQuestImage(`A busy child-friendly scene for I Spy: ${data.prompt}`);
      setImageUrl(img);
    } catch (e) {
      alert("My mystery eye is blinking! Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    if (!scene) return;
    const cleanInput = userInput.trim().toLowerCase();
    const cleanAnswer = scene.answer.trim().toLowerCase();

    if (cleanInput === cleanAnswer) {
      setFeedback({ status: 'correct', msg: `Excellent! It is the ${scene.answer}! ✅` });
      addPoints(50, "Solved I Spy Riddle! 👁️✨");
      playPronunciation(scene.answer);
    } else {
      setFeedback({ status: 'wrong', msg: "Not quite! Look closer... 🔍" });
    }
  };

  useEffect(() => {
    loadNewRiddle();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
      <button onClick={onBack} className="self-start text-emerald-600 font-bold mb-8 transition-transform hover:-translate-x-1">
        ⬅️ Back to Map
      </button>

      <div className="bg-white w-full rounded-[60px] shadow-2xl p-8 border-8 border-emerald-100 relative flex flex-col min-h-[500px] overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-50 rounded-full opacity-50" />
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <div className="w-20 h-20 border-[10px] border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
            <h3 className="text-3xl font-black text-emerald-600">Drawing the scene... 🎨</h3>
            <p className="text-gray-400 font-bold italic mt-2">Patience is a virtue, little explorer!</p>
          </div>
        ) : scene && imageUrl ? (
          <div className="animate-in zoom-in duration-500 flex flex-col">
             <h2 className="text-3xl font-black text-emerald-600 mb-6 text-center">Mystery Eye! 👁️</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="relative group">
                  <img src={imageUrl} alt="Mystery Scene" className="w-full aspect-square object-cover rounded-[40px] shadow-2xl border-8 border-white group-hover:scale-105 transition-transform" />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg animate-pulse">🔎</div>
                </div>

                <div className="flex flex-col gap-6">
                   <div className="bg-emerald-50 p-6 rounded-[35px] border-4 border-emerald-100 shadow-inner relative">
                      <div className="absolute -top-4 left-6 bg-white px-4 py-1 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest border-2 border-emerald-100">The Riddle</div>
                      <p className="text-2xl font-black text-emerald-700 leading-tight mb-3">"{scene.riddle}"</p>
                      <p className="text-sm italic text-emerald-400 font-bold">"{scene.idnRiddle}"</p>
                   </div>

                   <div className="space-y-4">
                      <input 
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type the object name in English..."
                        className="w-full p-5 rounded-[30px] border-4 border-emerald-50 outline-none focus:border-emerald-300 text-xl font-black shadow-inner bg-gray-50/30"
                        onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                      />
                      
                      {feedback && (
                        <div className={`p-4 rounded-2xl text-center font-black animate-in slide-in-from-top-2 ${feedback.status === 'correct' ? 'bg-green-100 text-green-600 border-2 border-green-200' : 'bg-rose-100 text-rose-600 border-2 border-rose-200'}`}>
                           {feedback.msg}
                        </div>
                      )}

                      <div className="flex gap-3">
                         <button 
                           onClick={handleCheck}
                           className="flex-1 bg-emerald-500 text-white py-5 rounded-[30px] font-black text-xl shadow-lg hover:bg-emerald-600 transition-all active:scale-95"
                         >
                           GUESS! 🗣️
                         </button>
                         {feedback?.status === 'correct' && (
                            <button 
                              onClick={loadNewRiddle}
                              className="bg-emerald-100 text-emerald-600 px-8 rounded-[30px] font-black hover:bg-emerald-200"
                            >
                              NEXT ➡️
                            </button>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
             <p className="text-gray-400 font-bold mb-4">Click to find a new mystery!</p>
             <button onClick={loadNewRiddle} className="bg-emerald-500 text-white px-10 py-4 rounded-full font-black text-xl shadow-lg">START NEW RIDDLE</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ISpyIsland;
