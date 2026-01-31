
import React, { useState, useRef } from 'react';
import { playPronunciation, evaluateMimicry } from '../services/geminiService';

interface MimicIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

const PHRASES = [
  "I am a brave explorer!",
  "The sky is very blue today.",
  "I love eating yummy apples!",
  "Toby is my best bear friend.",
  "Look at the giant dinosaur!"
];

const SKINS = [
  { name: 'Default', icon: '👤', color: 'bg-teal-500' },
  { name: 'Cyber Hero', icon: '🤖', color: 'bg-blue-600', minScore: 90 },
  { name: 'Crystal Fairy', icon: '🧚', color: 'bg-purple-500', minScore: 80 },
  { name: 'Golden King', icon: '👑', color: 'bg-yellow-500', minScore: 95 }
];

const MimicIsland: React.FC<MimicIslandProps> = ({ onBack, addPoints }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ score: number, feedback: string, idnFeedback: string } | null>(null);
  const [activeSkin, setActiveSkin] = useState(SKINS[0]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const target = PHRASES[currentIdx];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsAnalyzing(true);
        const evalResult = await evaluateMimicry(blob, target);
        setResult(evalResult);
        addPoints(Math.floor(evalResult.score / 2), "Mimicry Mastery! 🎙️");
        
        // Auto-unlock skin visuals
        const unlockedSkin = SKINS.slice().reverse().find(s => !s.minScore || evalResult.score >= s.minScore);
        if (unlockedSkin) setActiveSkin(unlockedSkin);
        
        setIsAnalyzing(false);
      };

      recorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      alert("Microphone needed! 🎤");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
      <button onClick={onBack} className="self-start text-teal-600 font-bold mb-8">⬅️ Back to Map</button>
      
      <div className={`${activeSkin.color} w-full p-10 rounded-[60px] shadow-2xl border-8 border-white text-center relative overflow-hidden transition-colors duration-1000`}>
        <div className="absolute top-0 left-0 p-10 opacity-10 text-9xl">👻</div>
        <div className="absolute top-4 right-10 bg-white/20 px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
           Voice Skin: {activeSkin.name}
        </div>

        <h2 className="text-4xl font-black text-white mb-4">Echo Woods 🎙️</h2>
        <p className="text-teal-100 font-bold mb-10 italic">Tiru suara Toby dan kumpulkan poin gema!</p>

        <div className="bg-white p-8 rounded-[40px] shadow-xl mb-10">
          <div className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2">Repeat this:</div>
          <h3 className="text-3xl font-black text-teal-700 mb-6 underline decoration-wavy underline-offset-8 decoration-teal-200">{target}</h3>
          
          <button 
            onClick={() => playPronunciation(target)}
            className="bg-teal-100 text-teal-600 px-6 py-2 rounded-full font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            <span>🔊</span> Listen to Toby
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-xl border-8 border-teal-400 z-10 relative ${isRecording ? 'animate-pulse scale-110' : ''}`}>
               {activeSkin.icon}
             </div>
             {result && result.score > 80 && (
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl animate-pulse -z-10 opacity-50" />
             )}
          </div>

          {!isRecording ? (
            <button 
              onClick={startRecording}
              disabled={isAnalyzing}
              className="px-12 py-4 bg-white text-teal-600 rounded-3xl font-black text-xl shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              🎤 START ECHO
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="px-12 py-4 bg-red-500 text-white rounded-3xl font-black text-xl shadow-xl animate-bounce border-4 border-white"
            >
              ⏹️ STOP ECHO
            </button>
          )}

          {isAnalyzing && (
            <div className="text-white font-black animate-pulse">Analyzing your echo... ✨</div>
          )}

          {result && (
            <div className="animate-in zoom-in duration-300 bg-white/95 p-8 rounded-[40px] shadow-2xl border-4 border-yellow-400 w-full max-w-sm">
              <div className="text-5xl font-black text-yellow-600 mb-2">{result.score}%</div>
              <div className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Accuracy Score</div>
              <p className="text-xl font-bold text-gray-800 leading-tight mb-2">"{result.feedback}"</p>
              <p className="text-xs italic text-gray-500 mb-6">"{result.idnFeedback}"</p>
              
              <button 
                onClick={() => { setCurrentIdx((prev) => (prev + 1) % PHRASES.length); setResult(null); }}
                className="w-full bg-teal-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-teal-600 shadow-lg"
              >
                NEXT PHRASE! ➡️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MimicIsland;
