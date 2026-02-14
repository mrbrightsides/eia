
import React, { useState, useRef } from 'react';
import { playPronunciation, evaluateIntroduction } from '../services/geminiService';
import { UserProfile, JournalEntry } from '../types';

interface GreetingIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  profile: UserProfile;
}

const STEPS = [
  { 
    id: 'name', 
    title: 'My Name', 
    idn: 'Nama Saya', 
    template: 'My name is [NAME].', 
    prompt: "Hello! Tell me your name clearly.",
    icon: '👤'
  },
  { 
    id: 'age', 
    title: 'My Age', 
    idn: 'Umur Saya', 
    template: 'I am [X] years old.', 
    prompt: "How old are you? Say it in English!",
    icon: '🎂'
  },
  { 
    id: 'hobby', 
    title: 'My Hobby', 
    idn: 'Hobi Saya', 
    template: 'I like [HOBBY].', 
    prompt: "What is your favorite hobby? (Swimming, reading, playing games...)",
    icon: '⚽'
  },
  { 
    id: 'feeling', 
    title: 'My Feeling', 
    idn: 'Perasaan Saya', 
    template: 'I am [FEELING].', 
    prompt: "How do you feel today? Happy? Excited? Brave?",
    icon: '😊'
  }
];

const GreetingIsland: React.FC<GreetingIslandProps> = ({ onBack, addPoints, onSave, profile }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '']);
  const [feedback, setFeedback] = useState<{ score: number, msg: string, idn: string } | null>(null);
  const [showBadge, setShowBadge] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const step = STEPS[currentStep];

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
        try {
          const result = await evaluateIntroduction(blob, step.template.replace('[NAME]', profile.name));
          setFeedback({ score: result.score, msg: result.feedback, idn: result.idnFeedback });
          
          const newAnswers = [...answers];
          newAnswers[currentStep] = result.recognizedText;
          setAnswers(newAnswers);

          if (result.score > 60) {
            addPoints(25, `Step ${currentStep + 1} Complete! 🌟`);
          }
        } catch (e) {
          alert("Toby's ears are fuzzy! Let's try again.");
        }
        setIsAnalyzing(false);
      };

      recorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      alert("I need your microphone to hear your beautiful voice! 🎤");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setFeedback(null);
    } else {
      setShowBadge(true);
      addPoints(100, "Master of Introductions! 🦸‍♂️");
    }
  };

  const handleSaveToScrapbook = () => {
     if (!onSave) return;
     // Simply use a fun emoji-based "Identity Card" text or capture the screen
     const finalIntro = answers.join(" ");
     onSave({
        type: 'badge',
        english: "Explorer Hero Introduction",
        indonesian: "Perkenalan Pahlawan Penjelajah",
        data: "https://loremflickr.com/600/400/badge,gold,hero" // Mock badge image
     });
     alert("Saved to your Scrapbook! 📓");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
      <button onClick={onBack} className="self-start text-blue-600 font-bold mb-8 hover:-translate-x-1 transition-transform">⬅️ Back to Islands</button>

      {!showBadge ? (
        <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl border-[10px] border-blue-500 overflow-hidden animate-in zoom-in duration-500">
           <div className="bg-blue-600 p-8 text-white text-center">
              <div className="text-7xl mb-4 animate-character-breathe">
                <span className="animate-character-blink block">{step.icon}</span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-widest">{step.title}</h2>
              <p className="text-blue-200 font-bold italic">{step.idn}</p>
           </div>

           <div className="p-10 text-center">
              <div className="mb-10 min-h-[100px] flex flex-col justify-center">
                 <h3 className="text-2xl font-black text-gray-800 mb-2 leading-tight">"{step.prompt}"</h3>
                 <p className="text-gray-400 font-bold italic">Example: "{step.template.replace('[NAME]', profile.name).replace('[X]', '10').replace('[HOBBY]', 'football').replace('[FEELING]', 'happy')}"</p>
              </div>

              {/* Steps Indicator */}
              <div className="flex justify-center gap-3 mb-10">
                 {STEPS.map((_, i) => (
                    <div key={i} className={`h-3 rounded-full transition-all duration-500 ${currentStep === i ? 'w-12 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : i < currentStep ? 'w-3 bg-green-500' : 'w-3 bg-gray-200'}`} />
                 ))}
              </div>

              <div className="flex flex-col items-center gap-6">
                 {!isRecording ? (
                    <button 
                       onClick={startRecording}
                       disabled={isAnalyzing}
                       className="w-24 h-24 bg-blue-500 text-white rounded-full flex items-center justify-center text-4xl shadow-xl hover:scale-110 active:scale-95 transition-all border-8 border-blue-100 group"
                    >
                       <span className="group-hover:rotate-12 transition-transform">🎤</span>
                    </button>
                 ) : (
                    <button 
                       onClick={stopRecording}
                       className="w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center text-4xl shadow-xl animate-pulse border-8 border-red-100"
                    >
                       <span>⏹️</span>
                    </button>
                 )}

                 {isAnalyzing && <p className="text-blue-600 font-black animate-pulse">Toby is listening... 🐻👂</p>}

                 {feedback && (
                    <div className={`w-full p-6 rounded-[30px] border-4 animate-in slide-in-from-bottom-5 ${feedback.score > 60 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                       <div className="text-3xl font-black mb-2">SCORE: {feedback.score}%</div>
                       <p className="font-bold leading-tight mb-2">"{feedback.msg}"</p>
                       <p className="text-xs italic opacity-70 mb-4">{feedback.idn}</p>
                       
                       {feedback.score > 60 && (
                          <button 
                            onClick={next}
                            className="bg-blue-600 text-white px-10 py-4 rounded-3xl font-black text-xl shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                          >
                            {currentStep === STEPS.length - 1 ? "FINISH ADVENTURE! 🚩" : "NEXT STEP ➡️"}
                          </button>
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl border-[15px] border-yellow-400 p-12 text-center animate-in zoom-in duration-500 relative overflow-hidden">
           {/* Background Confetti Pattern */}
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
           
           <div className="relative z-10">
              <div className="text-9xl mb-6 animate-bounce">🥇</div>
              <h2 className="text-4xl font-black text-blue-800 uppercase mb-2 tracking-tighter">HERO EXPLORER!</h2>
              <div className="bg-blue-50 p-8 rounded-[40px] border-4 border-dashed border-blue-200 mb-8">
                 <p className="text-2xl font-black text-blue-600 mb-6 underline decoration-wavy underline-offset-8">"Hello World!"</p>
                 <div className="space-y-4 text-left">
                    {answers.map((ans, i) => (
                       <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm">
                          <span className="text-2xl">{STEPS[i].icon}</span>
                          <span className="font-bold text-gray-700 italic">"{ans || '...'}"</span>
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="flex flex-col gap-4">
                 <button 
                    onClick={handleSaveToScrapbook}
                    className="w-full bg-purple-600 text-white py-5 rounded-3xl font-black text-2xl shadow-lg hover:bg-purple-700 active:scale-95 transition-all"
                 >
                    SAVE TO SCRAPBOOK 📓
                 </button>
                 <button 
                    onClick={onBack}
                    className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                 >
                    BACK TO MAP 🏝️
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GreetingIsland;
