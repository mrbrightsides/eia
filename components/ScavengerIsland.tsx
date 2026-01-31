
import React, { useState, useRef, useEffect } from 'react';
import { verifyScavengerHunt, playPronunciation } from '../services/geminiService';
import { JournalEntry } from '../types';

interface ScavengerIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}

const MISSIONS = [
  "Find a ROUND and RED object",
  "Find something made of PLASTIC",
  "Find a GREEN leaf or plant",
  "Find a SQUARE object",
  "Find a TOY you love"
];

const ScavengerIsland: React.FC<ScavengerIslandProps> = ({ onBack, addPoints, onSave }) => {
  const [missionIdx, setMissionIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ found: boolean, detail: string, englishWord: string } | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(ms);
      if (videoRef.current) videoRef.current.srcObject = ms;
    } catch (e) { alert("Camera needed!"); }
  };

  const stopCamera = () => stream?.getTracks().forEach(t => t.stop());

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || loading) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL('image/jpeg');
    
    setLoading(true);
    const data = await verifyScavengerHunt(base64, MISSIONS[missionIdx]);
    setResult(data);
    if (data.found) {
      addPoints(50, `Found a ${data.englishWord}! 🎒✨`);
      playPronunciation(data.englishWord);
      if (onSave) onSave({ type: 'photo', english: data.englishWord, indonesian: 'Misi Berburu', data: base64 });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center">
      <button onClick={onBack} className="self-start text-amber-600 font-bold mb-4">⬅️ Back</button>
      
      <div className="bg-amber-100 p-8 rounded-[50px] w-full text-center border-4 border-amber-200 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-2 right-4 text-4xl animate-character-breathe">🎒</div>
        <div className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Current Mission:</div>
        <h2 className="text-3xl font-black text-amber-700">{MISSIONS[missionIdx]}</h2>
      </div>

      <div className="relative w-full aspect-square md:aspect-video bg-black rounded-[40px] overflow-hidden border-8 border-white shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        {loading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-xl animate-pulse">Toby is checking... 🐾</div>}
        
        {result && (
          <div className="absolute inset-x-4 bottom-4 animate-in slide-in-from-bottom-5">
            <div className={`p-6 rounded-[30px] border-4 shadow-2xl ${result.found ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
              <h3 className={`text-2xl font-black mb-2 ${result.found ? 'text-green-700' : 'text-red-700'}`}>
                {result.found ? `SUCCESS! It's a ${result.englishWord}! ✨` : "NOT QUITE! 🐻"}
              </h3>
              <p className="text-gray-700 font-bold mb-4">{result.detail}</p>
              <button 
                onClick={() => { setResult(null); if (result.found) setMissionIdx((m) => (m + 1) % MISSIONS.length); }}
                className={`px-8 py-3 rounded-full font-black text-white ${result.found ? 'bg-green-500' : 'bg-red-500'}`}
              >
                {result.found ? "NEXT MISSION!" : "TRY AGAIN"}
              </button>
            </div>
          </div>
        )}
      </div>

      {!result && !loading && (
        <button 
          onClick={handleCapture}
          className="mt-8 bg-amber-500 w-24 h-24 rounded-full border-8 border-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
        >
          <span className="text-4xl text-white">📷</span>
        </button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ScavengerIsland;
