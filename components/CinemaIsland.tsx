
import React, { useState } from 'react';
import { createVeoInstance } from '../services/geminiService';
import { JournalEntry } from '../types';

interface CinemaIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}

const CHARACTERS = [
  { id: 'bear', name: 'Toby the Bear', icon: '🐻' },
  { id: 'owl', name: 'Mayor Hoot', icon: '🦉' },
  { id: 'fox', name: 'Smart Fox', icon: '🦊' },
  { id: 'dragon', name: 'Wordy', icon: '🐲' }
];

const STAGES = [
  { id: 'forest', name: 'Magic Forest', icon: '🌳' },
  { id: 'space', name: 'Outer Space', icon: '🚀' },
  { id: 'castle', name: 'Cloud Castle', icon: '🏰' },
  { id: 'beach', name: 'Island Beach', icon: '🏖️' }
];

const MESSAGES = [
  "Building the stage... 🏗️",
  "Dressing the puppets... 👗",
  "Lighting up the theater... 💡",
  "Practicing lines... 🐻💬",
  "Ready in 3... 2... 1... 🎬"
];

const CinemaIsland: React.FC<CinemaIslandProps> = ({ onBack, addPoints, onSave }) => {
  const [step, setStep] = useState(1);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState('forest');
  const [script, setScript] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(MESSAGES[0]);

  const handleGenerate = async () => {
    if (!script.trim() || selectedChars.length === 0) return;

    if (!(window as any).aistudio?.hasSelectedApiKey()) {
      alert("Please select your API key first!");
      await (window as any).aistudio?.openSelectKey();
    }

    setLoading(true);
    setVideoUrl(null);
    
    const msgInterval = setInterval(() => {
      setLoadingMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, 8000);

    try {
      const ai = createVeoInstance();
      const prompt = `A cute puppet theater performance. Stage: ${selectedStage}. Characters: ${selectedChars.join(", ")}. Story: ${script}. Bright cartoon style.`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      let maxRetries = 60; 
      while (!operation.done && maxRetries > 0) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        maxRetries--;
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        addPoints(100, "Puppet Master! 🎬✨");
        if (onSave) onSave({ type: 'movie', english: script, indonesian: 'Pertunjukan Teater', data: url });
      }
    } catch (err: any) {
      alert("The puppets are shy! Let's try again in a moment.");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const toggleChar = (id: string) => {
    setSelectedChars(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id].slice(0, 2)
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center min-h-[70vh]">
      <button onClick={onBack} className="self-start text-indigo-600 font-bold mb-8 flex items-center gap-2">
        ⬅️ Exit Theater
      </button>

      <div className="w-full bg-white rounded-[60px] shadow-2xl p-10 border-8 border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-9xl opacity-5">🎭</div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-8">
            <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-2xl font-black text-indigo-600 animate-pulse">{loadingMsg}</p>
          </div>
        ) : videoUrl ? (
          <div className="flex flex-col items-center animate-in zoom-in">
             <video src={videoUrl} controls autoPlay loop className="w-full rounded-[40px] shadow-2xl border-8 border-white mb-8" />
             <div className="flex gap-4">
                <button onClick={() => {setVideoUrl(null); setStep(1);}} className="bg-indigo-600 text-white px-10 py-4 rounded-3xl font-black text-xl shadow-lg">NEW SHOW 🎭</button>
             </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-8 px-4">
               {[1, 2, 3].map(s => (
                 <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                   {s}
                 </div>
               ))}
            </div>

            {step === 1 && (
              <div className="animate-in slide-in-from-right">
                <h3 className="text-2xl font-black text-indigo-600 mb-6">Step 1: Choose Your Puppets 🐻</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                  {CHARACTERS.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => toggleChar(c.id)}
                      className={`p-6 rounded-3xl border-4 transition-all ${selectedChars.includes(c.id) ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <div className="text-4xl mb-2">{c.icon}</div>
                      <div className="text-[10px] font-black uppercase">{c.name}</div>
                    </button>
                  ))}
                </div>
                <button 
                  disabled={selectedChars.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg disabled:opacity-30"
                >
                  NEXT ➡️
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right">
                <h3 className="text-2xl font-black text-indigo-600 mb-6">Step 2: Pick Your Stage 🏰</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                  {STAGES.map(s => (
                    <button 
                      key={s.id} 
                      onClick={() => setSelectedStage(s.id)}
                      className={`p-6 rounded-3xl border-4 transition-all ${selectedStage === s.id ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <div className="text-4xl mb-2">{s.icon}</div>
                      <div className="text-[10px] font-black uppercase">{s.name}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-3xl font-black text-xl">BACK</button>
                   <button onClick={() => setStep(3)} className="flex-2 bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl">NEXT ➡️</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in slide-in-from-right">
                <h3 className="text-2xl font-black text-indigo-600 mb-2">Step 3: Write the Story 📜</h3>
                <p className="text-gray-400 text-sm mb-6">Describe what happens in simple English!</p>
                <textarea 
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="e.g. Toby and Wordy are having a tea party in the magic forest. They are very happy!"
                  className="w-full h-40 p-6 rounded-3xl border-4 border-indigo-50 outline-none focus:border-indigo-400 text-xl font-medium mb-8"
                />
                <div className="flex gap-4">
                   <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-3xl font-black text-xl">BACK</button>
                   <button 
                     disabled={!script.trim()}
                     onClick={handleGenerate}
                     className="flex-2 bg-yellow-400 text-indigo-900 py-5 rounded-3xl font-black text-xl shadow-xl hover:bg-yellow-500 transition-all active:scale-95"
                   >
                     START SHOW! 🎬✨
                   </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaIsland;
