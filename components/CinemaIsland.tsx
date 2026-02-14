
import React, { useState, useEffect } from 'react';
import { createVeoInstance } from '../services/geminiService';
import { JournalEntry } from '../types';

interface CinemaIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}

const CHARACTERS = [
  { id: 'bear', name: 'Toby the Bear', icon: '🐻', description: 'Friendly and brown' },
  { id: 'owl', name: 'Mayor Hoot', icon: '🦉', description: 'Wise and feathered' },
  { id: 'fox', name: 'Smart Fox', icon: '🦊', description: 'Quick and orange' },
  { id: 'dragon', name: 'Wordy', icon: '🐲', description: 'Green and magical' }
];

const STAGES = [
  { id: 'forest', name: 'Magic Forest', idn: 'Hutan Ajaib', icon: '🌳' },
  { id: 'space', name: 'Outer Space', idn: 'Luar Angkasa', icon: '🚀' },
  { id: 'castle', name: 'Cloud Castle', idn: 'Istana Awan', icon: '🏰' },
  { id: 'beach', name: 'Island Beach', idn: 'Pantai Pulau', icon: '🏖️' }
];

const STORY_STARTERS = [
  { 
    title: "Tea Party 🍵", 
    idn: "Pesta Teh",
    prompt: "Having a lovely tea party with giant cookies. They are laughing and clinking cups." 
  },
  { 
    title: "The Race 🏁", 
    idn: "Balapan",
    prompt: "Racing on colorful skateboards through the area. They are wearing tiny helmets." 
  },
  { 
    title: "Magic Trick ✨", 
    idn: "Trik Sulap",
    prompt: "Performing a magic trick where a bouquet of flowers appears from a hat." 
  },
  { 
    title: "Stargazing 🔭", 
    idn: "Melihat Bintang",
    prompt: "Looking through a big telescope and pointing at a shooting star in the sky." 
  }
];

const LOADING_MESSAGES = [
  "Opening the heavy red curtains... 🎭",
  "Tuning the puppet strings... 🧶",
  "Lighting the magic stage lamps... 🕯️",
  "The puppets are practicing their lines... 🐻💬",
  "Painting the beautiful background scenery... 🎨",
  "Gathering the island audience... 🐢🦁🦊",
  "Almost ready for the premiere! 🎬",
  "The show is starting very soon! 🍿"
];

const CinemaIsland: React.FC<CinemaIslandProps> = ({ onBack, addPoints, onSave }) => {
  const [step, setStep] = useState(0); // 0: Key Check, 1: Characters, 2: Stage, 3: Script
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState('forest');
  const [script, setScript] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    // @ts-ignore
    const keySelected = await window.aistudio.hasSelectedApiKey();
    setHasKey(keySelected);
    if (keySelected) setStep(1);
  };

  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    // Assume success as per instructions to avoid race conditions
    setHasKey(true);
    setStep(1);
  };

  const handleGenerate = async () => {
    if (!script.trim() || selectedChars.length === 0) return;

    setLoading(true);
    setVideoUrl(null);
    
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 10000);

    try {
      const ai = createVeoInstance();
      const charDetails = selectedChars.map(id => CHARACTERS.find(c => c.id === id)?.name).join(" and ");
      const stageName = STAGES.find(s => s.id === selectedStage)?.name;
      
      const fullPrompt = `A high-quality, adorable 3D puppet theater animation for kids. Scene: ${stageName}. Main characters: ${charDetails}. Action: ${script}. Bright, vibrant colors, soft lighting, cheerful atmosphere, 4k resolution style.`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview', // High-quality model
        prompt: fullPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      let retries = 0;
      while (!operation.done && retries < 100) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        retries++;
      }

      if (operation.error && operation.error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setStep(0);
        throw new Error("API Key session expired.");
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const apiKey = process.env.API_KEY;
        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        addPoints(100, "Puppet Master! 🎬✨");
        if (onSave) onSave({ type: 'movie', english: script, indonesian: 'Film Boneka', data: url });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "The puppets are a bit shy! Let's check our ticket (API Key) and try again.");
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
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-indigo-600 font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
          ⬅️ Exit Theater (Keluar)
        </button>
        <div className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-black text-sm uppercase tracking-wider">
          Island Cinema 🎬
        </div>
      </div>

      <div className="w-full bg-white rounded-[60px] shadow-2xl p-8 border-8 border-indigo-100 relative overflow-hidden flex flex-col min-h-[500px]">
        {/* Decorative corner */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50" />
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="relative mb-12">
               <div className="w-32 h-32 border-[12px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">📽️</div>
            </div>
            <h3 className="text-3xl font-black text-indigo-600 mb-4 px-4">{loadingMsg}</h3>
            <p className="text-gray-400 font-bold max-w-sm italic">Making magic takes a little time! (Sihir butuh waktu sebentar ya!)</p>
          </div>
        ) : videoUrl ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-500 py-4">
             <div className="relative group w-full mb-8">
               <video src={videoUrl} controls autoPlay loop className="w-full rounded-[40px] shadow-2xl border-8 border-white" />
               <div className="absolute -top-4 -right-4 bg-yellow-400 text-indigo-900 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl animate-bounce font-black border-4 border-white">🎬</div>
             </div>
             <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => {setVideoUrl(null); setStep(1);}} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-3xl font-black text-xl shadow-lg transition-all active:scale-95"
                >
                  MAKE NEW MOVIE! 🎭
                </button>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {step === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 animate-in fade-in">
                <div className="text-8xl mb-6">🎟️</div>
                <h2 className="text-4xl font-black text-indigo-600 mb-4 uppercase">Get Your Movie Ticket!</h2>
                <p className="text-gray-500 font-bold mb-10 max-w-md">
                  To make high-quality AI movies, you need to sign in with your own magic ticket (API Key).
                  <br/><span className="text-xs opacity-60">(Dibutuhkan API Key untuk membuat video AI)</span>
                </p>
                <button 
                  onClick={handleSelectKey}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-[30px] font-black text-2xl shadow-xl transition-all active:scale-95 flex items-center gap-4"
                >
                  <span>🎟️</span> SELECT TICKET
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="mt-6 text-sm text-indigo-400 underline font-bold">About magic tickets (Billing info)</a>
              </div>
            )}

            {step > 0 && (
              <>
                <div className="flex justify-center gap-4 mb-10">
                   {[1, 2, 3].map(s => (
                     <div key={s} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${step === s ? 'bg-indigo-600 text-white scale-110 shadow-lg' : step > s ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                       {step > s ? '✅' : s}
                     </div>
                   ))}
                </div>

                {step === 1 && (
                  <div className="animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
                    <h3 className="text-3xl font-black text-indigo-600 mb-2">Who is in the story? 🐻</h3>
                    <p className="text-gray-400 font-bold mb-8 italic">Pilih karakter ceritamu (max 2)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                      {CHARACTERS.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => toggleChar(c.id)}
                          className={`p-6 rounded-[35px] border-4 transition-all flex flex-col items-center gap-2 group ${selectedChars.includes(c.id) ? 'bg-indigo-600 border-indigo-700 text-white shadow-xl scale-105' : 'bg-gray-50 border-gray-100 hover:bg-indigo-50'}`}
                        >
                          <div className="text-5xl group-hover:scale-110 transition-transform">{c.icon}</div>
                          <div className="text-[12px] font-black uppercase tracking-tighter">{c.name}</div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-auto pt-6 flex gap-4">
                        <button 
                          disabled={selectedChars.length === 0}
                          onClick={() => setStep(2)}
                          className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black text-2xl shadow-lg disabled:opacity-30 transition-all active:scale-95"
                        >
                          NEXT (LANJUT) ➡️
                        </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
                    <h3 className="text-3xl font-black text-indigo-600 mb-2">Where does it happen? 🏰</h3>
                    <p className="text-gray-400 font-bold mb-8 italic">Pilih panggung ceritamu</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                      {STAGES.map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => setSelectedStage(s.id)}
                          className={`p-6 rounded-[35px] border-4 transition-all flex flex-col items-center gap-2 group ${selectedStage === s.id ? 'bg-indigo-600 border-indigo-700 text-white shadow-xl scale-105' : 'bg-gray-50 border-gray-100 hover:bg-indigo-50'}`}
                        >
                          <div className="text-5xl group-hover:scale-110 transition-transform">{s.icon}</div>
                          <div className="text-[12px] font-black uppercase tracking-tighter">{s.name}</div>
                          <div className={`text-[10px] font-bold ${selectedStage === s.id ? 'text-indigo-200' : 'text-gray-400'}`}>{s.idn}</div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-auto pt-6 flex gap-4">
                       <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-3xl font-black text-xl hover:bg-gray-200">BACK</button>
                       <button onClick={() => setStep(3)} className="flex-2 bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg transition-all active:scale-95">NEXT ➡️</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
                    <h3 className="text-3xl font-black text-indigo-600 mb-2">What happens? 📜</h3>
                    <p className="text-gray-400 font-bold mb-4 italic">Tulis ceritamu dalam Bahasa Inggris!</p>
                    
                    <div className="flex-1 flex flex-col gap-4">
                        <textarea 
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          placeholder="Example: Toby finds a magic golden key under a big tree. He is very surprised!"
                          className="w-full h-40 p-6 rounded-[30px] border-4 border-indigo-50 outline-none focus:border-indigo-400 text-xl font-medium shadow-inner bg-sky-50/20"
                        />
                        
                        <div>
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Magic Starters (Ide Cerita):</p>
                           <div className="grid grid-cols-2 gap-2">
                             {STORY_STARTERS.map((s, i) => (
                               <button 
                                 key={i} 
                                 onClick={() => setScript(s.prompt)}
                                 className="text-left bg-white border-2 border-indigo-50 p-3 rounded-2xl hover:border-indigo-300 transition-all group active:scale-95"
                               >
                                 <div className="font-black text-indigo-600 text-sm group-hover:text-indigo-700">{s.title}</div>
                                 <div className="text-[10px] text-gray-400 font-bold uppercase">{s.idn}</div>
                               </button>
                             ))}
                           </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                       <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-3xl font-black text-xl hover:bg-gray-200">BACK</button>
                       <button 
                         disabled={!script.trim()}
                         onClick={handleGenerate}
                         className="flex-2 bg-yellow-400 text-indigo-900 py-5 rounded-3xl font-black text-2xl shadow-xl hover:bg-yellow-500 transition-all active:scale-95 ring-4 ring-yellow-100"
                       >
                         MAKE MOVIE! 🎬✨
                       </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      <p className="mt-8 text-gray-400 text-sm font-bold text-center px-4 italic max-w-md">
        "Every master storyteller started with a simple idea. Use your words to bring the puppets to life!"
      </p>
    </div>
  );
};

export default CinemaIsland;
