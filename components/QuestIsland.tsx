
import React, { useState } from 'react';
import { generateQuestImage } from '../services/geminiService';
import { JournalEntry } from '../types';

interface QuestIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}

const QuestIsland: React.FC<QuestIslandProps> = ({ onBack, addPoints, onSave }) => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl(null);
    const url = await generateQuestImage(prompt);
    if (url) {
      setImageUrl(url);
      addPoints(30, "Created a Magical Artwork! 🎨");
    }
    setLoading(false);
  };

  const handleSaveToScrapbook = () => {
    if (!imageUrl || !onSave) return;
    onSave({
      type: 'drawing',
      english: prompt,
      indonesian: 'Karya Seniku',
      data: imageUrl
    });
    addPoints(10, "Added to Scrapbook! 📓");
  };

  const handleSaveImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    const fileName = `my-english-adventure-${prompt.toLowerCase().replace(/\s+/g, '-') || 'drawing'}.png`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addPoints(10, "Saved your masterpiece! 💾");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-center relative overflow-hidden">
      {/* Dynamic Background Stars */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className="absolute animate-pulse text-2xl"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="text-blue-600 font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
            ⬅️ Back
          </button>
        </div>

        <h2 className="text-4xl font-bold text-blue-700 mb-2 animate-bounce-slow">Magical Canvas! 🎨</h2>
        <p className="text-gray-600 mb-8 text-lg italic">Type something in English and watch it appear!</p>

        <div className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-dashed border-blue-200 group transition-all hover:border-blue-400">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A flying purple cat"
              className="flex-1 p-5 rounded-3xl border-2 border-gray-100 focus:border-blue-500 outline-none text-xl shadow-inner bg-sky-50/30"
            />
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-10 py-5 rounded-3xl font-black text-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "BRUSHING..." : "CREATE! ✨"}
            </button>
          </div>

          <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-[30px] relative overflow-hidden group">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="text-6xl animate-bounce">🖌️</div>
                <p className="text-blue-600 font-bold animate-pulse">Magic is happening... ✨</p>
              </div>
            ) : imageUrl ? (
              <div className="animate-in zoom-in duration-500 w-full h-full flex flex-col items-center p-4">
                <div className="relative group">
                  <img src={imageUrl} alt="Generated quest" className="max-w-full h-auto rounded-2xl shadow-xl mb-6 border-8 border-white ring-4 ring-blue-50" />
                  {/* Cheering Squad */}
                  <div className="absolute -bottom-4 -left-8 text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🐰</div>
                  <div className="absolute -bottom-4 -right-8 text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🐼</div>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl animate-pulse">👑</div>
                </div>
                
                <div className="flex flex-col gap-4 w-full items-center">
                  <div className="p-4 bg-green-100 text-green-700 rounded-2xl font-black shadow-sm flex items-center gap-3">
                    <span className="text-2xl">🌟</span>
                    <span>Wow! You drew a <span className="underline decoration-wavy underline-offset-4">{prompt}</span>!</span>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={handleSaveToScrapbook}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
                    >
                      <span>📓</span> Add to Scrapbook
                    </button>
                    <button 
                      onClick={handleSaveImage}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
                    >
                      <span>💾</span> Save Device
                    </button>
                    <button 
                      onClick={() => setImageUrl(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-8 py-3 rounded-full font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                      <span>🗑️</span> New Drawing
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-300 flex flex-col items-center p-20 border-4 border-dashed border-gray-100 rounded-[20px]">
                <span className="text-9xl opacity-20 mb-4 group-hover:scale-110 transition-transform">🖼️</span>
                <p className="text-xl font-bold italic">Your artwork will appear here!</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SuggestionCard text="A happy puppy" idn="Anak anjing bahagia" onClick={() => setPrompt("A happy puppy")} />
          <SuggestionCard text="Red space rocket" idn="Roket luar angkasa merah" onClick={() => setPrompt("Red space rocket")} />
          <SuggestionCard text="Castle in the sky" idn="Istana di awan" onClick={() => setPrompt("Castle in the sky")} />
        </div>
      </div>
    </div>
  );
};

const SuggestionCard: React.FC<{ text: string; idn: string; onClick: () => void }> = ({ text, idn, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group active:scale-95"
  >
    <div className="font-bold text-blue-600 group-hover:translate-x-1 transition-transform">{text}</div>
    <div className="text-[10px] text-gray-400 font-bold uppercase">{idn}</div>
  </button>
);

export default QuestIsland;
