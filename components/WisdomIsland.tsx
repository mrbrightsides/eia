
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry } from '../types';

interface WisdomIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onSave: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}

const ISLAMIC_TERMS = [
  {
    english: "Fasting",
    indonesian: "Puasa",
    description: "Not eating or drinking from dawn until sunset to learn patience and empathy.",
    icon: "🌙",
    fact: "Fasting is called 'Sawm' in Arabic."
  },
  {
    english: "Prayer",
    indonesian: "Shalat",
    description: "Talking to Allah five times a day to show gratitude and seek guidance.",
    icon: "🕌",
    fact: "Muslims pray facing the Kaaba in Mecca."
  },
  {
    english: "Charity",
    indonesian: "Zakat / Sedekah",
    description: "Giving part of what we have to help people who are in need.",
    icon: "🤝",
    fact: "Helping others is a big part of being a good person!"
  },
  {
    english: "Faith",
    indonesian: "Iman",
    description: "Believing in Allah, His angels, His books, and His prophets.",
    icon: "✨",
    fact: "Faith is like a light in our hearts."
  },
  {
    english: "Pilgrimage",
    indonesian: "Haji",
    description: "A special journey to the holy city of Mecca.",
    icon: "🕋",
    fact: "It's one of the five pillars of Islam."
  },
  {
    english: "Remembrance",
    indonesian: "Dzikir",
    description: "Remembering Allah by repeating beautiful words of praise.",
    icon: "📿",
    fact: "Dzikr brings peace to the heart."
  }
];

const DZIKR_PHRASES = [
  {
    arabic: "SubhanAllah",
    english: "Glory be to Allah",
    indonesian: "Maha Suci Allah",
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    arabic: "Alhamdulillah",
    english: "Praise be to Allah",
    indonesian: "Segala puji bagi Allah",
    color: "bg-blue-100 text-blue-700"
  },
  {
    arabic: "Allahu Akbar",
    english: "Allah is the Greatest",
    indonesian: "Allah Maha Besar",
    color: "bg-amber-100 text-amber-700"
  },
  {
    arabic: "Astaghfirullah",
    english: "I seek forgiveness from Allah",
    indonesian: "Aku memohon ampun kepada Allah",
    color: "bg-rose-100 text-rose-700"
  }
];

const WisdomIsland: React.FC<WisdomIslandProps> = ({ onBack, addPoints, onSave }) => {
  const [view, setView] = useState<'menu' | 'vocab' | 'dzikr' | 'quiz'>('menu');
  const [selectedTerm, setSelectedTerm] = useState<typeof ISLAMIC_TERMS[0] | null>(null);
  const [dzikrIndex, setDzikrIndex] = useState(0);
  const [dzikrCount, setDzikrCount] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleDzikrClick = () => {
    setDzikrCount(prev => prev + 1);
    if ((dzikrCount + 1) % 33 === 0) {
      addPoints(10, `Completed 33x ${DZIKR_PHRASES[dzikrIndex].arabic}! ✨`);
    }
  };

  const nextDzikr = () => {
    setDzikrIndex((dzikrIndex + 1) % DZIKR_PHRASES.length);
    setDzikrCount(0);
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
      addPoints(5, "Correct Answer! 🌟");
    }
    if (quizIndex < ISLAMIC_TERMS.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setShowResult(true);
      if (score + (isCorrect ? 1 : 0) === ISLAMIC_TERMS.length) {
        addPoints(50, "Perfect Wisdom Quiz! 🏆");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#062c2b] p-6 pb-24 relative overflow-hidden">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0.1 + Math.random() * 0.3,
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{ 
              y: [null, "-20px", "20px", "0px"],
              x: [null, "10px", "-10px", "0px"],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
            className="absolute text-2xl"
          >
            {i % 3 === 0 ? "🌙" : i % 3 === 1 ? "⭐" : "✨"}
          </motion.div>
        ))}
        {/* Large Decorative Moons */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 text-[200px] opacity-5 text-emerald-100"
        >
          🌙
        </motion.div>
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 text-[250px] opacity-5 text-emerald-100"
        >
          🌙
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={view === 'menu' ? onBack : () => setView('menu')}
            className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20 text-emerald-50 hover:scale-105 transition-all"
          >
            {view === 'menu' ? '⬅️ Back to Map' : '⬅️ Back to Wisdom Menu'}
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-black text-emerald-50">Wisdom Island 🕌</h1>
            <p className="text-emerald-300/60 font-bold italic">Pulau Kebijaksanaan</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <MenuCard 
                title="Word Gallery" 
                subtitle="Galeri Kata" 
                icon="📚" 
                color="bg-emerald-600"
                onClick={() => setView('vocab')}
              />
              <MenuCard 
                title="Dzikr Garden" 
                subtitle="Taman Dzikir" 
                icon="📿" 
                color="bg-teal-600"
                onClick={() => setView('dzikr')}
              />
              <MenuCard 
                title="Wisdom Quiz" 
                subtitle="Kuis Bijak" 
                icon="🧠" 
                color="bg-amber-600"
                onClick={() => setView('quiz')}
              />
            </motion.div>
          )}

          {view === 'vocab' && (
            <motion.div 
              key="vocab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ISLAMIC_TERMS.map(term => (
                  <button
                    key={term.english}
                    onClick={() => setSelectedTerm(term)}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl shadow-sm border-2 border-white/10 hover:border-emerald-400 hover:bg-white/10 hover:scale-105 transition-all flex flex-col items-center text-center"
                  >
                    <span className="text-5xl mb-3">{term.icon}</span>
                    <span className="font-black text-emerald-50 text-lg">{term.english}</span>
                    <span className="text-xs text-emerald-300/60 font-bold uppercase">{term.indonesian}</span>
                  </button>
                ))}
              </div>

              {selectedTerm && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-md p-8 rounded-[40px] shadow-xl border-4 border-emerald-500/30 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl">
                    {selectedTerm.icon}
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">{selectedTerm.icon}</span>
                      <div>
                        <h2 className="text-4xl font-black text-emerald-400 uppercase">{selectedTerm.english}</h2>
                        <p className="text-emerald-200/60 font-bold italic">Artinya: {selectedTerm.indonesian}</p>
                      </div>
                    </div>
                    <p className="text-xl text-emerald-50/90 leading-relaxed mb-6 font-medium">
                      {selectedTerm.description}
                    </p>
                    <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-500/20">
                      <p className="text-emerald-200 font-bold italic">
                        💡 Fun Fact: {selectedTerm.fact}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        onSave({
                          type: 'drawing', 
                          english: selectedTerm.english,
                          indonesian: selectedTerm.indonesian,
                          data: `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedTerm.english}&backgroundColor=b6e3f4`
                        });
                        addPoints(10, "Added to Scrapbook! 📓");
                      }}
                      className="mt-6 w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-500 active:scale-95 transition-all"
                    >
                      ADD TO SCRAPBOOK 📓
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {view === 'dzikr' && (
            <motion.div 
              key="dzikr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className={`w-full max-w-md p-10 rounded-[50px] shadow-2xl border-8 border-white/10 text-center mb-8 transition-colors bg-white/5 backdrop-blur-md`}>
                <h2 className="text-5xl font-black mb-2 text-emerald-50">{DZIKR_PHRASES[dzikrIndex].arabic}</h2>
                <h3 className="text-2xl font-bold mb-1 italic text-emerald-300">"{DZIKR_PHRASES[dzikrIndex].english}"</h3>
                <p className="text-sm opacity-60 font-black uppercase tracking-widest text-emerald-100">{DZIKR_PHRASES[dzikrIndex].indonesian}</p>
                
                <div className="mt-10 mb-6">
                  <div className="text-8xl font-black opacity-20 text-emerald-50">{dzikrCount}</div>
                  <div className="text-xs font-black uppercase tracking-widest opacity-40 text-emerald-50">Count / Hitungan</div>
                </div>

                <button 
                  onClick={handleDzikrClick}
                  className="w-32 h-32 bg-emerald-600 rounded-full shadow-xl border-4 border-emerald-500/30 flex items-center justify-center text-4xl hover:scale-110 active:scale-90 transition-all mx-auto mb-6"
                >
                  📿
                </button>

                <div className="flex justify-center gap-2">
                  {Array.from({ length: 33 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all ${i < dzikrCount % 33 ? 'bg-emerald-400 scale-125' : 'bg-white opacity-10'}`}
                    />
                  ))}
                </div>
              </div>

              <button 
                onClick={nextDzikr}
                className="bg-emerald-800 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-700 active:scale-95 transition-all border border-emerald-600/30"
              >
                NEXT PHRASE ➡️
              </button>
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto"
            >
              {!showResult ? (
                <div className="bg-white/10 backdrop-blur-md p-10 rounded-[40px] shadow-xl border-4 border-amber-500/30">
                  <div className="flex justify-between items-center mb-8">
                    <span className="bg-amber-500/20 text-amber-300 px-4 py-1 rounded-full font-black text-xs uppercase border border-amber-500/30">Question {quizIndex + 1} / {ISLAMIC_TERMS.length}</span>
                    <span className="text-emerald-200/60 font-black text-sm">Score: {score}</span>
                  </div>
                  
                  <h2 className="text-3xl font-black text-emerald-50 mb-8 text-center">
                    What is the English word for <span className="text-amber-400">"{ISLAMIC_TERMS[quizIndex].indonesian}"</span>?
                  </h2>

                  <div className="grid grid-cols-1 gap-4">
                    {[...ISLAMIC_TERMS].sort(() => Math.random() - 0.5).slice(0, 3).concat(ISLAMIC_TERMS[quizIndex]).sort(() => Math.random() - 0.5).map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(term.english === ISLAMIC_TERMS[quizIndex].english)}
                        className="p-6 rounded-2xl border-4 border-white/5 bg-white/5 hover:border-amber-400 hover:bg-white/10 transition-all text-left flex items-center gap-4"
                      >
                        <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-amber-300 border border-white/10">{String.fromCharCode(65 + i)}</span>
                        <span className="text-xl font-black text-emerald-50">{term.english}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md p-12 rounded-[50px] shadow-2xl border-8 border-emerald-500/30 text-center">
                  <div className="text-8xl mb-6">🏆</div>
                  <h2 className="text-4xl font-black text-emerald-50 mb-2">QUIZ COMPLETE!</h2>
                  <p className="text-xl text-emerald-200/60 font-bold mb-8">You scored {score} out of {ISLAMIC_TERMS.length}!</p>
                  <div className="bg-emerald-900/40 p-6 rounded-3xl mb-8 border-2 border-emerald-500/20">
                    <div className="text-3xl font-black text-emerald-400">+{score * 10} ⭐</div>
                    <div className="text-xs font-black text-emerald-300 uppercase tracking-widest mt-1">Wisdom Points Earned</div>
                  </div>
                  <button 
                    onClick={() => {
                      setView('menu');
                      setQuizIndex(0);
                      setScore(0);
                      setShowResult(false);
                    }}
                    className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black text-2xl shadow-lg hover:bg-emerald-500 active:scale-95 transition-all"
                  >
                    PLAY AGAIN! 🔄
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MenuCard: React.FC<{ title: string, subtitle: string, icon: string, color: string, onClick: () => void }> = ({ title, subtitle, icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] shadow-sm border-2 border-white/10 hover:scale-105 transition-all group relative overflow-hidden text-left"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:rotate-12 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-emerald-50 leading-tight">{title}</h3>
    <p className="text-emerald-300/60 font-bold italic">{subtitle}</p>
    <div className="mt-6 flex items-center gap-2 text-emerald-400/40 font-black text-xs uppercase tracking-widest">
      <span>Explore</span>
      <span className="group-hover:translate-x-2 transition-transform">➡️</span>
    </div>
  </button>
);

export default WisdomIsland;
