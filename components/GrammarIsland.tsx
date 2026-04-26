
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GrammarIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

interface Question {
  id: number;
  type: 'mcq';
  question: string;
  options: string[];
  answer: string;
  story?: string;
}

const QUESTIONS: Question[] = [
  // Section 1: Sarah's Story (Reading Comprehension)
  {
    id: 1,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "What time does Sarah wake up in the morning?",
    options: ["6:00 AM", "6:15 AM", "6:30 AM", "7:00 AM"],
    answer: "6:30 AM"
  },
  {
    id: 2,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "How does Sarah go to work?",
    options: ["By car", "By bus", "By bike", "On foot"],
    answer: "By bus"
  },
  {
    id: 3,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "What does Sarah usually have for breakfast?",
    options: ["Toast and coffee", "Eggs and milk", "Cereal and juice", "Fruit and tea"],
    answer: "Toast and coffee"
  },
  {
    id: 4,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "Does Sarah enjoy her job? Why or why not?",
    options: [
      "No, she hates her job.",
      "Yes, because she works with friendly colleagues.",
      "No, she wants to be a doctor.",
      "Yes, because she likes the office building."
    ],
    answer: "Yes, because she works with friendly colleagues."
  },
  {
    id: 5,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "What does Sarah do in the evening?",
    options: [
      "She goes to the gym.",
      "She works overtime.",
      "She likes to relax by reading a book or watching TV.",
      "She goes out with friends."
    ],
    answer: "She likes to relax by reading a book or watching TV."
  },
  {
    id: 6,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "6. Every weekend, Jack ___ to the gym to stay healthy.",
    options: ["go", "goes"],
    answer: "goes"
  },
  {
    id: 7,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "7. He ___ up at 7:00 AM on Saturdays and Sundays.",
    options: ["wake", "wakes"],
    answer: "wakes"
  },
  {
    id: 8,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "8. After he ___ his breakfast...",
    options: ["finish", "finishes"],
    answer: "finishes"
  },
  {
    id: 9,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "9. ...he ___ to the gym.",
    options: ["drive", "drives"],
    answer: "drives"
  },
  {
    id: 10,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "10. He ___ out for an hour...",
    options: ["work", "works"],
    answer: "works"
  },
  {
    id: 11,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "11. ...and then he ___ a shower.",
    options: ["take", "takes"],
    answer: "takes"
  },
  {
    id: 12,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "12. After the gym, Jack ___ home...",
    options: ["go", "goes"],
    answer: "goes"
  },
  {
    id: 13,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "13. ...and ___ by watching TV or reading a book.",
    options: ["relax", "relaxes"],
    answer: "relaxes"
  },
  {
    id: 14,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "14. On Sundays, he ___ his friends for lunch...",
    options: ["meet", "meets"],
    answer: "meets"
  },
  {
    id: 15,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "15. They ___ about their week...",
    options: ["talk", "talks"],
    answer: "talk"
  },
  {
    id: 16,
    type: 'mcq',
    question: "Which sentence is in the present tense?",
    options: ["She is studying now.", "She studied yesterday.", "She studies every day.", "She will study tomorrow."],
    answer: "She studies every day."
  },
  {
    id: 17,
    type: 'mcq',
    question: "Choose the correct form of the verb: “My brother __ (like) to play soccer.”",
    options: ["likes", "like", "liking", "is liking"],
    answer: "likes"
  },
  {
    id: 18,
    type: 'mcq',
    question: "Choose the correct sentence:",
    options: ["She don’t like coffee.", "She doesn’t like coffee.", "She doesn’t likes coffee.", "She don’t likes coffee."],
    answer: "She doesn’t like coffee."
  },
  {
    id: 19,
    type: 'mcq',
    question: "Complete the sentence: “I __ (go) to the park every Saturday.”",
    options: ["goes", "going", "go", "gone"],
    answer: "go"
  },
  {
    id: 20,
    type: 'mcq',
    question: "Choose the correct sentence:",
    options: ["They plays basketball every Sunday.", "They play basketball every Sunday.", "They play basketball every Sundays.", "They playing basketball every Sunday."],
    answer: "They play basketball every Sunday."
  },
  {
    id: 21,
    type: 'mcq',
    question: "I __ to school by bus every day.",
    options: ["go", "goes", "going", "gone"],
    answer: "go"
  },
  {
    id: 22,
    type: 'mcq',
    question: "She __ to the gym in the evening.",
    options: ["go", "goes", "going", "gone"],
    answer: "goes"
  },
  {
    id: 23,
    type: 'mcq',
    question: "They __ soccer every weekend.",
    options: ["plays", "play", "playing", "played"],
    answer: "play"
  },
  {
    id: 24,
    type: 'mcq',
    question: "We __ TV every night.",
    options: ["watch", "watches", "watching", "watched"],
    answer: "watch"
  },
  {
    id: 25,
    type: 'mcq',
    question: "He __ his homework every afternoon.",
    options: ["does", "do", "doing", "did"],
    answer: "does"
  },
  {
    id: 26,
    type: 'mcq',
    question: "She __ her friends at the park.",
    options: ["meet", "meets", "meeting", "met"],
    answer: "meets"
  },
  {
    id: 27,
    type: 'mcq',
    question: "I __ like to read books.",
    options: ["don’t", "doesn’t", "do", "does"],
    answer: "don’t"
  },
  {
    id: 28,
    type: 'mcq',
    question: "They __ to the beach every summer.",
    options: ["go", "goes", "going", "gone"],
    answer: "go"
  },
  {
    id: 29,
    type: 'mcq',
    question: "He __ breakfast at 7:00 AM.",
    options: ["eat", "eats", "eating", "eaten"],
    answer: "eats"
  },
  {
    id: 30,
    type: 'mcq',
    question: "We __ to the gym twice a week.",
    options: ["goes", "go", "going", "gone"],
    answer: "go"
  },
  {
    id: 31,
    type: 'mcq',
    question: "Sarah __ her homework now.",
    options: ["do", "does", "is doing", "doing"],
    answer: "does"
  },
  {
    id: 32,
    type: 'mcq',
    question: "My parents __ to the market every Saturday.",
    options: ["goes", "going", "go", "gone"],
    answer: "go"
  },
  {
    id: 33,
    type: 'mcq',
    question: "I __ my teeth after breakfast.",
    options: ["brush", "brushes", "brushing", "brushed"],
    answer: "brush"
  },
  {
    id: 34,
    type: 'mcq',
    question: "She __ a book in the evening.",
    options: ["read", "reads", "reading", "readed"],
    answer: "reads"
  },
  {
    id: 35,
    type: 'mcq',
    question: "We __ coffee every morning.",
    options: ["drink", "drinks", "drinking", "drank"],
    answer: "drink"
  },
  {
    id: 36,
    type: 'mcq',
    question: "He __ at 9:00 AM every day.",
    options: ["wake", "wakes", "waking", "woke"],
    answer: "wakes"
  },
  {
    id: 37,
    type: 'mcq',
    question: "You __ very fast.",
    options: ["runs", "run", "running", "ran"],
    answer: "run"
  },
  {
    id: 38,
    type: 'mcq',
    question: "She __ to music every evening.",
    options: ["listen", "listens", "listening", "listened"],
    answer: "listens"
  },
  {
    id: 39,
    type: 'mcq',
    question: "I __ my phone in the bag.",
    options: ["put", "puts", "putting", "putted"],
    answer: "put"
  },
  {
    id: 40,
    type: 'mcq',
    question: "He __ to the office by car.",
    options: ["drive", "drives", "driving", "driven"],
    answer: "drives"
  },
  {
    id: 41,
    type: 'mcq',
    question: "They __ lunch at noon.",
    options: ["have", "has", "having", "had"],
    answer: "have"
  },
  {
    id: 42,
    type: 'mcq',
    question: "She __ a shower every morning.",
    options: ["take", "takes", "taking", "taken"],
    answer: "takes"
  },
  {
    id: 43,
    type: 'mcq',
    question: "My brother __ football with his friends.",
    options: ["play", "plays", "playing", "played"],
    answer: "plays"
  },
  {
    id: 44,
    type: 'mcq',
    question: "We __ our lessons in the afternoon.",
    options: ["study", "studies", "studying", "studied"],
    answer: "study"
  },
  {
    id: 45,
    type: 'mcq',
    question: "You __ always on time.",
    options: ["are", "is", "am", "be"],
    answer: "are"
  },
  {
    id: 46,
    type: 'mcq',
    question: "The teacher __ the lesson every day.",
    options: ["teach", "teaches", "teaching", "taught"],
    answer: "teaches"
  },
  {
    id: 47,
    type: 'mcq',
    question: "They __ to the zoo every summer.",
    options: ["goes", "go", "going", "gone"],
    answer: "go"
  },
  {
    id: 48,
    type: 'mcq',
    question: "She __ the piano very well.",
    options: ["plays", "play", "playing", "played"],
    answer: "plays"
  },
  {
    id: 49,
    type: 'mcq',
    question: "He __ a cup of tea every morning.",
    options: ["drink", "drinks", "drinking", "drank"],
    answer: "drinks"
  },
  {
    id: 50,
    type: 'mcq',
    question: "I __ my homework after school.",
    options: ["do", "does", "doing", "did"],
    answer: "do"
  }
];

interface GrammarMastery {
  simplePresent: number;
}

const STUDY_CONTENT = {
  simplePresent: {
    title: "Simple Present Tense 📚",
    tips: [
      {
        title: "1. Affirmative (Positif)",
        description: "Digunakan untuk menyatakan kebiasaan atau fakta umum.",
        pattern: "Subject + Verb 1 (+ s/es for he/she/it)",
        examples: [
          "I play soccer every Sunday.",
          "She eats an apple in the morning.",
          "They study English together."
        ],
        icon: "✅"
      },
      {
        title: "2. Negative (Negatif)",
        description: "Gunakan 'do not' (don't) atau 'does not' (doesn't) diikuti kata kerja dasar.",
        pattern: "Subject + don't/doesn't + Verb 1",
        examples: [
          "I don't play soccer on Mondays.",
          "He doesn't eat spicy food.",
          "We don't watch TV late at night."
        ],
        icon: "❌"
      },
      {
        title: "3. Interrogative (Tanya)",
        description: "Awali kalimat dengan 'Do' atau 'Does', lalu gunakan kata kerja dasar.",
        pattern: "Do/Does + Subject + Verb 1?",
        examples: [
          "Do you like coffee?",
          "Does she speak Indonesian?",
          "Do they live in Jakarta?"
        ],
        icon: "❓"
      },
      {
        title: "4. The 's/es' Rules (He/She/It)",
        description: "Ingat! Tambahkan s/es hanya jika subjeknya He, She, atau It.",
        rules: [
          "Umum: Tambahkan -s (walk -> walks, eat -> eats)",
          "Akhiran o, ch, sh, x, ss: Tambahkan -es (go -> goes, watch -> watches, wash -> washes)",
          "Konsonan + y: Ubah y menjadi i + es (study -> studies, fly -> flies)"
        ],
        icon: "✏️"
      }
    ]
  }
};

const GrammarIsland: React.FC<GrammarIslandProps> = ({ onBack, addPoints }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(QUESTIONS.length).fill(''));
  const [isFinished, setIsFinished] = useState(false);
  const [view, setView] = useState<'menu' | 'study' | 'quiz'>('menu');
  const [mastery, setMastery] = useState<GrammarMastery>(() => {
    const saved = localStorage.getItem('grammar_mastery');
    return saved ? JSON.parse(saved) : { simplePresent: 0 };
  });
  const [showReview, setShowReview] = useState(false);

  const currentQuestion = QUESTIONS[currentIdx];

  const handleAnswer = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = option;
    setAnswers(newAnswers);
  };

  const saveProgress = (newScore: number) => {
    const updatedMastery = { ...mastery, simplePresent: Math.max(mastery.simplePresent, Math.round(newScore)) };
    setMastery(updatedMastery);
    localStorage.setItem('grammar_mastery', JSON.stringify(updatedMastery));
  };

  const nextQuestion = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
      const score = calculateScore();
      saveProgress(score);
      addPoints(Math.round(score), `Completed Grammar Practice with score ${Math.round(score)}!`);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const calculateScore = () => {
    const correctCount = answers.reduce((acc, ans, idx) => {
      return ans === QUESTIONS[idx].answer ? acc + 1 : acc;
    }, 0);
    return (correctCount / QUESTIONS.length) * 100;
  };

  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center">
        <header className="w-full max-w-4xl flex justify-between items-center mb-8">
          <button onClick={onBack} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black shadow-lg hover:scale-105 transition-all">
            ⬅️ Back to Map
          </button>
          <h1 className="text-3xl font-black text-indigo-900">Grammar Island ✍️</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl pt-10">
          {/* Mastery Card */}
          <div className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center text-center">
            <div className="text-7xl mb-6">🏝️</div>
            <h2 className="text-2xl font-black text-indigo-900 mb-2">My Progress</h2>
            <div className="w-full bg-indigo-50 p-6 rounded-3xl mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-indigo-400">Simple Present</span>
                <span className="font-black text-indigo-600">{mastery.simplePresent}%</span>
              </div>
              <div className="w-full h-3 bg-indigo-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${mastery.simplePresent}%` }}
                  className="h-full bg-indigo-500" 
                />
              </div>
            </div>
            <p className="text-gray-400 font-bold italic text-sm">Keep practicing to reach 100%!</p>
          </div>

          {/* Simple Present Module */}
          <div className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col">
            <div className="text-5xl mb-4 text-left">📝</div>
            <h2 className="text-3xl font-black text-indigo-600 mb-2">Present Tense</h2>
            <p className="text-gray-500 font-bold mb-8 flex-1">
              Master the basics of daily routines and general truths in English.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setView('study')}
                className="w-full bg-indigo-100 text-indigo-600 py-4 rounded-2xl font-black shadow-sm hover:bg-indigo-200 transition-all"
              >
                STUDY TIPS 📚
              </button>
              <button 
                onClick={() => setView('quiz')}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
              >
                TAKE QUIZ 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'study') {
    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center pb-24">
        <header className="w-full max-w-4xl flex justify-between items-center mb-8">
          <button onClick={() => setView('menu')} className="bg-white text-indigo-600 px-6 py-2 rounded-full font-black shadow-md border-2 border-indigo-100">
            ⬅️ Menu
          </button>
          <h2 className="text-2xl font-black text-indigo-900">{STUDY_CONTENT.simplePresent.title}</h2>
          <div className="w-10" />
        </header>

        <div className="w-full max-w-3xl space-y-6">
          {STUDY_CONTENT.simplePresent.tips.map((tip, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[40px] shadow-xl border-l-[12px] border-indigo-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{tip.icon}</span>
                <h3 className="text-xl font-black text-indigo-600">{tip.title}</h3>
              </div>
              <p className="text-gray-600 font-bold italic mb-4">{tip.description}</p>
              {tip.pattern && (
                <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-dashed border-indigo-200 mb-4 font-mono text-indigo-600 font-bold">
                   Pattern: {tip.pattern}
                </div>
              )}
              {tip.examples && (
                <ul className="space-y-2">
                  {tip.examples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-indigo-400">•</span>
                      <span className="font-semibold">{ex}</span>
                    </li>
                  ))}
                </ul>
              )}
              {tip.rules && (
                <div className="space-y-3">
                  {tip.rules.map((rule, i) => (
                    <div key={i} className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-800 text-sm font-bold">
                       {rule}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          
          <div className="pt-10 flex justify-center">
            <button 
              onClick={() => setView('quiz')}
              className="bg-indigo-600 text-white px-12 py-5 rounded-[30px] font-black text-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
            >
              READY FOR QUIZ? 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const score = calculateScore();
    const correctCount = answers.reduce((acc, ans, idx) => {
        return ans === QUESTIONS[idx].answer ? acc + 1 : acc;
    }, 0);

    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center overflow-y-auto">
        <div className="bg-white w-full max-w-2xl p-12 rounded-[50px] shadow-2xl text-center mt-10 mb-20 relative">
          {!showReview ? (
            <>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-9xl mb-6"
              >
                {score >= 80 ? '🏆' : score >= 60 ? '🌟' : '📚'}
              </motion.div>
              <h2 className="text-5xl font-black text-indigo-600 mb-2">Quiz Finished!</h2>
              <p className="text-2xl font-bold text-gray-400 mb-8 uppercase tracking-widest">Your Result</p>
              
              <div className="bg-indigo-50 p-12 rounded-[40px] border-4 border-indigo-100 mb-10 text-left">
                <div className="text-center mb-8">
                  <div className="text-8xl font-black text-indigo-600">{Math.round(score)}</div>
                  <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mt-2">Final Score</div>
                  <div className="mt-2 text-gray-500 font-bold uppercase text-[10px]">You got {correctCount} out of {QUESTIONS.length} right!</div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-black text-indigo-900 border-b border-indigo-200 pb-2">💡 Quick Reinforcement</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Remember! We use <span className="font-bold text-indigo-600">Simple Present</span> for routines and facts. 
                    Add <span className="font-bold border-b-2 border-indigo-200">-s/-es</span> only for <span className="italic">He, She, It</span>. 
                    For negatives and questions, use <span className="font-bold">Do</span> or <span className="font-bold">Does</span> + Verb 1 (no -s).
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                    onClick={() => setShowReview(true)}
                    className="w-full bg-indigo-500 text-white py-5 rounded-3xl font-black text-xl shadow-lg hover:bg-indigo-600 transition-all"
                >
                    REVIEW MISTAKES 🔍
                </button>
                <div className="flex gap-4">
                  <button 
                      onClick={() => { setIsFinished(false); setCurrentIdx(0); setAnswers(new Array(QUESTIONS.length).fill('')); }}
                      className="flex-1 bg-white border-4 border-indigo-200 text-indigo-500 py-4 rounded-3xl font-black text-lg hover:bg-indigo-50 transition-all"
                  >
                      RETRY
                  </button>
                  <button 
                      onClick={onBack}
                      className="flex-1 bg-indigo-600 text-white py-4 rounded-3xl font-black text-lg shadow-lg hover:bg-indigo-700 transition-all"
                  >
                      BACK TO MAP
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-left">
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-indigo-900 uppercase">Review Answers</h2>
                  <button onClick={() => setShowReview(false)} className="text-4xl text-gray-300 hover:text-indigo-600">✕</button>
               </div>
               
               <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-indigo-100">
                  {QUESTIONS.map((q, idx) => {
                    const isCorrect = answers[idx] === q.answer;
                    if (isCorrect) return null; // Show only mistakes or all? Usually users want to see mistakes.
                    return (
                      <div key={idx} className="bg-rose-50 p-6 rounded-3xl border-2 border-rose-100 relative">
                         <div className="absolute top-4 right-4 text-rose-500">❌</div>
                         <h4 className="font-black text-rose-900 mb-2">Q{idx + 1}: {q.question}</h4>
                         <div className="space-y-2 text-sm">
                            <div className="p-3 bg-white/60 rounded-xl">
                               <span className="font-bold text-gray-400">Your Answer:</span> <span className="font-black text-rose-500">{answers[idx]}</span>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-xl border border-emerald-200">
                               <span className="font-bold text-emerald-600">Correct Answer:</span> <span className="font-black text-emerald-700">{q.answer}</span>
                            </div>
                         </div>
                      </div>
                    );
                  })}
                  {correctCount === QUESTIONS.length && (
                    <div className="text-center py-20">
                       <div className="text-6xl mb-4">🌈</div>
                       <h3 className="text-2xl font-black text-indigo-600">Perfect Score!</h3>
                       <p className="text-gray-400 font-bold">You didn't make any mistakes.</p>
                    </div>
                  )}
               </div>
               
               <button 
                  onClick={() => setShowReview(false)}
                  className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-lg hover:bg-indigo-700 transition-all"
               >
                  DONE REVIEWING
               </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <header className="w-full max-w-4xl flex justify-between items-center mb-8 relative z-10">
        <button onClick={() => setView('menu')} className="bg-white text-indigo-600 px-6 py-2 rounded-full font-black shadow-md border-2 border-indigo-100 hover:scale-105 transition-all">
          ⬅️ Exit
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Question</span>
            <span className="text-2xl font-black text-indigo-900">{currentIdx + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="w-32 h-3 bg-indigo-200 rounded-full overflow-hidden">
            <div 
                className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
            />
        </div>
      </header>

      <div className="w-full max-w-3xl relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="bg-white p-10 rounded-[60px] shadow-2xl border-b-[16px] border-indigo-100 relative overflow-hidden"
          >
            {currentQuestion.story && (
              <div className="bg-indigo-50/50 p-6 rounded-3xl mb-8 border-2 border-dashed border-indigo-100">
                <h4 className="text-xs font-black text-indigo-300 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <span className="text-base text-indigo-600">📖</span> Story Context
                </h4>
                <p className="text-gray-700 font-medium leading-relaxed italic">
                  {currentQuestion.story}
                </p>
              </div>
            )}

            <h3 className="text-2xl font-black text-gray-800 mb-10 leading-tight">
              {currentQuestion.question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className={`p-6 rounded-[30px] font-black text-lg transition-all border-4 text-left group relative ${
                    answers[currentIdx] === option 
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xl scale-[1.02]' 
                      : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  <span className={`inline-block w-8 h-8 rounded-full border-2 mr-4 text-center leading-7 text-sm ${answers[currentIdx] === option ? 'border-white/50 bg-white/20' : 'border-indigo-100 bg-indigo-50 text-indigo-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                  {answers[currentIdx] === option && (
                    <motion.div 
                      layoutId="check"
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-xl"
                    >
                      ✨
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-10">
          <button 
            onClick={prevQuestion}
            disabled={currentIdx === 0}
            className="bg-white text-indigo-600 px-10 py-5 rounded-[25px] font-black text-lg border-4 border-indigo-100 shadow-lg hover:bg-indigo-50 disabled:opacity-30 transition-all active:scale-95"
          >
            PREV
          </button>
          
          <div className="hidden md:flex flex-col items-center">
             <div className="text-indigo-300 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Status</div>
             <div className="flex gap-2">
                {[...Array(Math.min(5, QUESTIONS.length))].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < answers.filter(a => a !== '').length % 5 ? 'bg-indigo-500' : 'bg-indigo-100'}`} />
                ))}
             </div>
          </div>

          <button 
            onClick={nextQuestion}
            disabled={answers[currentIdx] === ''}
            className="bg-indigo-600 text-white px-10 py-5 rounded-[25px] font-black text-lg shadow-xl hover:bg-indigo-700 active:scale-95 disabled:opacity-30 transition-all"
          >
            {currentIdx === QUESTIONS.length - 1 ? 'FINISH 🎉' : 'NEXT ➡️'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrammarIsland;
