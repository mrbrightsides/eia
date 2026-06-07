import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    title: 'MY NAME', 
    idn: 'Nama Saya', 
    template: 'My full name is [NAME].', 
    prompt: "Hello! Tell me your name clearly.",
    example: "My name is Farez.",
    icon: (
      <svg className="w-20 h-20 mx-auto my-2 text-violet-300 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    )
  },
  { 
    id: 'nickname', 
    title: 'MY NICKNAME', 
    idn: 'Nama Panggilan', 
    template: 'You can call me [NICKNAME].', 
    prompt: "What is your nickname?",
    example: "You can call me Farez.",
    icon: (
      <svg className="w-20 h-20 mx-auto my-2 text-violet-300 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 12h10v2H7zM7 8h10v2H7zm-2 9l-2-2V4a2 2 0 012-2h14a2 2 0 012 2v10l-2 2H5zm14-1V4H5v11.17L19 15.17z" />
      </svg>
    )
  },
  { 
    id: 'birth', 
    title: 'PLACE & DATE OF BIRTH', 
    idn: 'Tempat Tanggal Lahir', 
    template: 'I was born in [PLACE] on [DATE].', 
    prompt: "Where and when were you born?",
    example: "I was born in Jakarta on August fifth.",
    icon: (
      <svg className="w-20 h-20 mx-auto my-2 text-violet-300 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 6a3 3 0 110-6 3 3 0 010 6zm-7.5 1.5h15v3H4.5v-3zm13.13 6H6.37C4.12 13.5 2 15.62 2 17.87V24h20v-6.13c0-2.25-2.12-4.37-4.37-4.37z" />
      </svg>
    )
  },
  { 
    id: 'hobby', 
    title: 'MY HOBBY', 
    idn: 'Hobi Saya', 
    template: 'My favorite hobby is [HOBBY].', 
    prompt: "What is your favorite hobby?",
    example: "My favorite hobby is swimming.",
    icon: (
      <svg className="w-20 h-20 mx-auto my-2 text-violet-300 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      </svg>
    )
  },
  { 
    id: 'address', 
    title: 'WHERE I LIVE', 
    idn: 'Tempat Tinggal', 
    template: 'I live in [CITY].', 
    prompt: "Where do you live?",
    example: "I live in Palembang.",
    icon: (
      <svg className="w-20 h-20 mx-auto my-2 text-violet-300 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    )
  },
  { 
    id: 'school', 
    title: 'MY SCHOOL', 
    idn: 'Asal Sekolah Saya', 
    template: 'I study at [SCHOOL].', 
    prompt: "Which school do you study at?",
    example: "I study at Bina Darma Elementary School.",
    icon: (
      <svg className="w-20 h-20 mx-auto my-2 text-violet-300 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
      </svg>
    )
  },
  { 
    id: 'spell', 
    title: 'SPELL MY NAME', 
    idn: 'Cara Mengeja Nama', 
    template: 'My name is spelled: [S-P-E-L-L].', 
    prompt: "How do you spell your name clearly?",
    example: "My name is spelled: F - A - R - E - Z.",
    icon: (
      <svg className="w-20 h-20 mx-auto my-2 text-violet-300 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.72 2.03c-.38-.04-.76-.04-1.15 0l-7.75 1C3.1 3.12 2.61 3.7 2.69 4.41c.08.71.66 1.2 1.37 1.12L11 4.56v15.01L6.78 18c-.62-.19-1.27.15-1.46.77-.19.62.15 1.27.77 1.46l5.22 1.63c.46.14.93.14 1.39 0l5.22-1.63c.62-.19.96-.84.77-1.46-.19-.62-.84-.96-1.46-.77L13 19.57V4.56l7.14.92c.71.09 1.29-.4 1.37-1.11.08-.71-.41-1.29-1.11-1.37" />
      </svg>
    )
  }
];

const GreetingIsland: React.FC<GreetingIslandProps> = ({ onBack, addPoints, onSave, profile }) => {
  const [activeTab, setActiveTab] = useState<'tips' | 'practice'>('tips');
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [answers, setAnswers] = useState<string[]>(Array(STEPS.length).fill(''));
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
            addPoints(25, `Step ${currentStep + 1} Selesai! 🌟`);
          }
        } catch (e) {
          alert("Suara tidak terdengar jelas! Yuk kita coba sekali lagi.");
        }
        setIsAnalyzing(false);
      };

      recorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      alert("Izin mic dibutuhkan untuk merekam suara kamu yang hebat! 🎤");
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
     onSave({
        type: 'badge',
        english: "Explorer Hero Introduction",
        indonesian: "Perkenalan Pahlawan Penjelajah",
        data: "https://loremflickr.com/600/400/badge,gold,hero"
     });
     alert("Berhasil disimpan ke Scrapbook! 📓");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full flex justify-between items-center mb-6">
        <button 
          onClick={onBack} 
          className="bg-white/90 border-2 border-slate-200 px-4 py-2 rounded-2xl text-blue-600 font-extrabold shadow-sm hover:bg-slate-50 hover:-translate-x-1 transition-all flex items-center gap-2"
        >
          <span>⬅️</span> Back to Islands
        </button>
        
        {/* Toggle Mode Swapper */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-2 border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-5 py-2 rounded-xl font-black transition-all ${
              activeTab === 'tips' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📖 Panduan Manual
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-5 py-2 rounded-xl font-black transition-all ${
              activeTab === 'practice' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎤 Misi Praktik
          </button>
        </div>
      </div>

      {activeTab === 'tips' ? (
        <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-2xl border-8 border-blue-400 p-8 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 uppercase tracking-tight">📖 Panduan Memperkenalkan Diri</h1>
            <p className="text-slate-500 font-semibold mt-2">Pelajari cara memperkenalkan diri kamu yang keren dalam Bahasa Inggris!</p>
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {STEPS.map((s, index) => (
              <div 
                key={s.id} 
                className="bg-blue-50/50 hover:bg-blue-50 border-2 border-blue-100 rounded-3xl p-6 transition-all shadow-sm flex items-start gap-4"
              >
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm flex-none">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-blue-900">{s.title}</h3>
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">{s.idn}</p>
                    </div>
                    {/* Speak Button */}
                    <button
                      onClick={() => playPronunciation(s.example)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-800 w-10 h-10 rounded-2xl flex items-center justify-center text-lg hover:scale-105 active:scale-95 transition-all shadow-sm"
                      title="Dengarkan Suara Toby!"
                    >
                      🔊
                    </button>
                  </div>

                  <div className="mt-4 bg-white rounded-2xl p-4 border border-blue-100">
                    <div className="mb-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Formula</span>
                      <p className="text-slate-700 font-mono text-sm mt-1">{s.template}</p>
                    </div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Contoh Kalimat</span>
                      <p className="text-blue-900 font-extrabold text-lg mt-1 italic">"{s.example}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setActiveTab('practice')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-3xl font-black text-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              🎤 Mulai Misi Praktik Membaca!
            </button>
          </div>
        </div>
      ) : (
        /* PRACTICE VIEW - AS SHOWN IN THE USER ATTACHED SCREENSHOT */
        <div className="w-full flex flex-col items-center">
          {!showBadge ? (
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl border-[10px] border-blue-500 overflow-hidden animate-in zoom-in duration-300">
              {/* Header inside the image: Blue header, with a purple centered 3D representation avatar sign, and MY NAME in white and subtext */}
              <div className="bg-blue-600 p-8 text-white text-center relative">
                {step.icon}
                <h2 className="text-3xl font-black uppercase tracking-widest">{step.title}</h2>
                <p className="text-blue-200 font-bold italic">{step.idn}</p>
              </div>

              {/* White section underneath containing double quoted prompt message and smaller italicized sample text */}
              <div className="p-10 text-center bg-white">
                <div className="mb-10 min-h-[100px] flex flex-col justify-center">
                  <h3 className="text-3xl font-extrabold text-slate-800 mb-3 leading-tight font-sans">
                    "{step.prompt}"
                  </h3>
                  <p className="text-slate-400 font-bold italic text-base">
                    Example: "{step.example}"
                  </p>
                </div>

                {/* Steps Indicator - just like the screenshot, a blue solid pill and round light-blue dots */}
                <div className="flex justify-center gap-3 mb-10">
                  {STEPS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        currentStep === i 
                          ? 'w-12 bg-blue-600 shadow-sm' 
                          : i < currentStep 
                            ? 'w-3 bg-emerald-500' 
                            : 'w-3 bg-slate-200'
                      }`} 
                    />
                  ))}
                </div>

                {/* Microphone / Record Circle button with custom styling */}
                <div className="flex flex-col items-center gap-6">
                  {!isRecording ? (
                    <button 
                      onClick={startRecording}
                      disabled={isAnalyzing}
                      className="w-24 h-24 bg-blue-500 text-white rounded-full flex items-center justify-center text-4xl shadow-xl hover:scale-110 active:scale-95 transition-all border-8 border-blue-100 group cursor-pointer"
                    >
                      <span className="group-hover:rotate-12 transition-transform">🎤</span>
                    </button>
                  ) : (
                    <button 
                      onClick={stopRecording}
                      className="w-24 h-24 bg-rose-500 text-white rounded-full flex items-center justify-center text-4xl shadow-xl animate-pulse border-8 border-rose-100 cursor-pointer"
                    >
                      <span>⏹️</span>
                    </button>
                  )}

                  {isAnalyzing && (
                    <p className="text-blue-600 font-black animate-pulse bg-blue-50 px-4 py-2 rounded-full border border-blue-100 text-sm">
                      Toby is listening... 🐻👂
                    </p>
                  )}

                  {feedback && (
                    <div className={`w-full p-6 rounded-[30px] border-4 animate-in slide-in-from-bottom-5 ${
                      feedback.score > 60 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <div className="text-3xl font-black mb-2">SCORE: {feedback.score}%</div>
                      <p className="font-extrabold leading-tight mb-2">"{feedback.msg}"</p>
                      <p className="text-xs italic opacity-80 mb-4">{feedback.idn}</p>
                      
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
            <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl border-[15px] border-amber-400 p-12 text-center animate-in zoom-in duration-500 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              
              <div className="relative z-10">
                <div className="text-9xl mb-6 animate-bounce">🥇</div>
                <h2 className="text-4xl font-black text-blue-900 uppercase mb-2 tracking-tighter">HERO EXPLORER!</h2>
                <p className="text-slate-500 font-bold mb-6">Kamu telah berhasil memperkenalkan diri dalam Bahasa Inggris!</p>
                
                <div className="bg-blue-50 p-8 rounded-[40px] border-4 border-dashed border-blue-200 mb-8">
                  <p className="text-2xl font-black text-blue-600 mb-6 underline decoration-wavy underline-offset-8">"Hello World!"</p>
                  <div className="space-y-4 text-left max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {answers.map((ans, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-blue-50">
                        <span className="bg-blue-100 p-2 rounded-xl text-blue-600 text-sm font-black flex-none">#{i+1}</span>
                        <div className="flex-1">
                          <p className="text-xs text-slate-400 font-extrabold uppercase">{STEPS[i].title}</p>
                          <span className="font-bold text-slate-800 italic">"{ans || '...'}"</span>
                        </div>
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
      )}
    </div>
  );
};

export default GreetingIsland;
