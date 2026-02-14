
import React, { useState } from 'react';

interface TutorialOverlayProps {
  onComplete: () => void;
  userName: string;
}

const TUTORIAL_STEPS = [
  {
    title: "Welcome aboard! 🚢",
    idnTitle: "Selamat Datang!",
    description: "I'm Toby! I'll help you explore English Island. Are you ready for an adventure?",
    idnDescription: "Aku Toby! Aku akan membantumu menjelajahi Pulau Inggris. Siap bertualang?",
    icon: "🐻",
    color: "from-blue-400 to-blue-600"
  },
  {
    title: "Stars & Fire! ⭐🔥",
    idnTitle: "Bintang & Api!",
    description: "Earn Stars by playing games. Come back every day to keep your Streak Fire burning!",
    idnDescription: "Dapatkan Bintang dengan bermain. Datanglah setiap hari agar Api Gairahmu tetap menyala!",
    icon: "🔥",
    color: "from-orange-400 to-red-500"
  },
  {
    title: "Explore Islands! 🏝️",
    idnTitle: "Jelajahi Pulau!",
    description: "Each island has a different game! Learn words, sing songs, or use the Magic Lens to find real objects.",
    idnDescription: "Setiap pulau punya game beda! Belajar kata, bernyanyi, atau gunakan Lensa Ajaib.",
    icon: "🗺️",
    color: "from-emerald-400 to-teal-600"
  },
  {
    title: "Your Scrapbook 📓",
    idnTitle: "Buku Kenanganmu",
    description: "Save your drawings and photos in your Scrapbook to remember everything you've learned!",
    idnDescription: "Simpan gambar dan fotomu di Buku Kenangan untuk mengingat semua yang sudah dipelajari!",
    icon: "📓",
    color: "from-purple-400 to-indigo-600"
  },
  {
    title: "Meet Wordy! 🐲",
    idnTitle: "Kenalan dengan Wordy!",
    description: "This is Wordy. Feed him the English words you learn to help him grow into a giant dragon!",
    idnDescription: "Ini Wordy. Beri dia makan kata-kata Inggris agar dia tumbuh jadi naga raksasa!",
    icon: "🐲",
    color: "from-pink-400 to-rose-600"
  }
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, userName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[300] bg-blue-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white/20 rounded-full animate-float-slow"
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="bg-white w-full max-w-lg rounded-[60px] shadow-[0_30px_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in duration-500 border-[12px] border-white relative">
        {/* Top Gradient Header */}
        <div className={`bg-gradient-to-br ${step.color} p-10 text-white text-center transition-colors duration-700`}>
          <div className="text-9xl mb-4 animate-character-breathe inline-block">
             <span className="animate-character-blink block drop-shadow-lg">{step.icon}</span>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-1">{step.title}</h2>
          <p className="text-white/70 font-bold italic">{step.idnTitle}</p>
        </div>

        {/* Content Body */}
        <div className="p-10 text-center">
          <div className="min-h-[120px] flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-800 leading-tight mb-4">
              {currentStep === 0 ? `Hi ${userName}! ` : ""}{step.description}
            </h3>
            <p className="text-gray-400 font-medium italic">
              {step.idnDescription}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 my-8">
            {TUTORIAL_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-500 ${currentStep === i ? 'w-10 bg-blue-600' : 'w-2 bg-gray-200'}`}
              />
            ))}
          </div>

          <div className="flex gap-4">
            {currentStep > 0 && (
               <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-3xl font-black text-xl hover:bg-gray-200 active:scale-95 transition-all"
               >
                 BACK
               </button>
            )}
            <button 
              onClick={next}
              className={`flex-[2] bg-gradient-to-r ${step.color} text-white py-5 rounded-3xl font-black text-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all ring-8 ring-blue-50`}
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? "LET'S PLAY! 🚀" : "NEXT ➡️"}
            </button>
          </div>
        </div>
        
        {/* Toby's Speech Tail */}
        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 border-r-[12px] border-b-[12px] border-white"></div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default TutorialOverlay;
