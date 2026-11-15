import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry } from '../types';
import { safeSetItem } from '../services/storageService';

export interface ListeningQuestion {
  id: number;
  before: string;
  options: [string, string];
  correct: string;
  after: string;
  fullLine: string;
  idnExplanation: string;
  targetWord: string;
  targetWordIdn: string;
  time: number; // approximate seconds in song
}

export interface ListeningSong {
  id: string;
  title: string;
  idnTitle: string;
  icon: string;
  themeColor: string;
  bgGradient: string;
  accentColor: string;
  youtubeId: string;
  description: string;
  questions: ListeningQuestion[];
}

export const LISTENING_SONGS: ListeningSong[] = [
  {
    id: 'macdonald',
    title: 'Old MacDonald Had a Farm',
    idnTitle: 'Pak MacDonald Punya Kebun',
    icon: '🚜',
    themeColor: 'from-amber-500 to-orange-500',
    bgGradient: 'bg-amber-50',
    accentColor: 'border-amber-400 text-amber-600',
    youtubeId: '_6HzoUcx3eo',
    description: 'Listen to the farm animals and past tense grammar verbs!',
    questions: [
      {
        id: 1,
        before: 'Old MacDonald ',
        options: ['had', 'has'],
        correct: 'had',
        after: ' a farm, E-I-E-I-O!',
        fullLine: 'Old MacDonald had a farm, E-I-E-I-O!',
        idnExplanation: "'Had' adalah bentuk lampau (past tense) dari have/has. Pak MacDonald punya kebun!",
        targetWord: 'had',
        targetWordIdn: 'memiliki (lampau)',
        time: 0
      },
      {
        id: 2,
        before: 'And on that farm he had a ',
        options: ['cow', 'cat'],
        correct: 'cow',
        after: ', E-I-E-I-O!',
        fullLine: 'And on that farm he had a cow, E-I-E-I-O!',
        idnExplanation: "Cow = sapi (hewan di kebun penghasil susu)!",
        targetWord: 'cow',
        targetWordIdn: 'sapi',
        time: 8
      },
      {
        id: 3,
        before: 'With a ',
        options: ['moo-moo', 'baa-baa'],
        correct: 'moo-moo',
        after: ' here, and a moo-moo there!',
        fullLine: 'With a moo-moo here, and a moo-moo there!',
        idnExplanation: "Suara khas sapi dalam bahasa Inggris adalah 'moo-moo'!",
        targetWord: 'moo-moo',
        targetWordIdn: 'suara sapi',
        time: 15
      },
      {
        id: 4,
        before: 'Here a moo, there a moo, everywhere a ',
        options: ['moo-moo', 'quack-quack'],
        correct: 'moo-moo',
        after: '!',
        fullLine: 'Here a moo, there a moo, everywhere a moo-moo!',
        idnExplanation: "'Everywhere' artinya di mana-mana!",
        targetWord: 'everywhere',
        targetWordIdn: 'di mana-mana',
        time: 19
      },
      {
        id: 5,
        before: 'Old MacDonald had a ',
        options: ['farm', 'park'],
        correct: 'farm',
        after: ', E-I-E-I-O!',
        fullLine: 'Old MacDonald had a farm, E-I-E-I-O!',
        idnExplanation: "Farm = peternakan/kebun, sedangkan park = taman bermain.",
        targetWord: 'farm',
        targetWordIdn: 'kebun / peternakan',
        time: 22
      }
    ]
  },
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    idnTitle: 'Bintang Kecil Berkelap-Kelip',
    icon: '⭐',
    themeColor: 'from-indigo-500 to-purple-600',
    bgGradient: 'bg-indigo-50',
    accentColor: 'border-indigo-400 text-indigo-600',
    youtubeId: '0_1e8hW_S5w',
    description: 'Listen to gentle words about stars, diamonds, and the night sky!',
    questions: [
      {
        id: 1,
        before: 'Twinkle, twinkle, ',
        options: ['little', 'big'],
        correct: 'little',
        after: ' star,',
        fullLine: 'Twinkle, twinkle, little star,',
        idnExplanation: "Little = kecil. Bintang kecil yang berkedip di malam hari!",
        targetWord: 'little',
        targetWordIdn: 'kecil',
        time: 0
      },
      {
        id: 2,
        before: 'How I ',
        options: ['wonder', 'wander'],
        correct: 'wonder',
        after: ' what you are!',
        fullLine: 'How I wonder what you are!',
        idnExplanation: "Wonder = ingin tahu atau takjub. Beda dengan wander (berkelana)!",
        targetWord: 'wonder',
        targetWordIdn: 'ingin tahu / takjub',
        time: 4
      },
      {
        id: 3,
        before: 'Up ',
        options: ['above', 'below'],
        correct: 'above',
        after: ' the world so high,',
        fullLine: 'Up above the world so high,',
        idnExplanation: "Above = di atas, so high = sangat tinggi!",
        targetWord: 'above',
        targetWordIdn: 'di atas',
        time: 8
      },
      {
        id: 4,
        before: 'Like a ',
        options: ['diamond', 'circle'],
        correct: 'diamond',
        after: ' in the sky.',
        fullLine: 'Like a diamond in the sky.',
        idnExplanation: "Diamond = intan berlian yang bersinar terang!",
        targetWord: 'diamond',
        targetWordIdn: 'berlian / intan',
        time: 12
      },
      {
        id: 5,
        before: 'Twinkle, twinkle, little ',
        options: ['star', 'sun'],
        correct: 'star',
        after: '!',
        fullLine: 'Twinkle, twinkle, little star!',
        idnExplanation: "Star = bintang!",
        targetWord: 'star',
        targetWordIdn: 'bintang',
        time: 16
      }
    ]
  },
  {
    id: 'wheels',
    title: 'The Wheels on the Bus',
    idnTitle: 'Roda Bus Berputar',
    icon: '🚌',
    themeColor: 'from-amber-400 to-yellow-600',
    bgGradient: 'bg-yellow-50',
    accentColor: 'border-yellow-400 text-yellow-700',
    youtubeId: 'GzrjwOQpAl0',
    description: 'Listen to the wheels, wipers, horn, and sound of the yellow bus!',
    questions: [
      {
        id: 1,
        before: 'The wheels on the bus go ',
        options: ['round', 'square'],
        correct: 'round',
        after: ' and round,',
        fullLine: 'The wheels on the bus go round and round,',
        idnExplanation: "Round = bulat/berputar, sedangkan square = kotak!",
        targetWord: 'wheels',
        targetWordIdn: 'roda-roda',
        time: 5
      },
      {
        id: 2,
        before: 'Round and round, ',
        options: ['round', 'sound'],
        correct: 'round',
        after: ' and round.',
        fullLine: 'Round and round, round and round.',
        idnExplanation: "Round and round = berputar terus berulang-ulang!",
        targetWord: 'round',
        targetWordIdn: 'berputar / bulat',
        time: 9
      },
      {
        id: 3,
        before: 'The wheels on the bus go round and round, all through the ',
        options: ['town', 'house'],
        correct: 'town',
        after: '!',
        fullLine: 'All through the town!',
        idnExplanation: "Town = kota kecil yang dilewati rute bus!",
        targetWord: 'town',
        targetWordIdn: 'kota',
        time: 13
      },
      {
        id: 4,
        before: 'The wipers on the bus go ',
        options: ['swish', 'swim'],
        correct: 'swish',
        after: ', swish, swish!',
        fullLine: 'The wipers on the bus go swish, swish, swish!',
        idnExplanation: "Swish, swish = bunyi pembersih kaca bus saat bergerak menyeka air!",
        targetWord: 'wipers',
        targetWordIdn: 'penyeka kaca bus',
        time: 21
      },
      {
        id: 5,
        before: 'The horn on the bus goes ',
        options: ['beep', 'bark'],
        correct: 'beep',
        after: ', beep, beep!',
        fullLine: 'The horn on the bus goes beep, beep, beep!',
        idnExplanation: "Klakson kendaraan berbunyi beep beep! (bukan bark seperti anjing)!",
        targetWord: 'horn',
        targetWordIdn: 'klakson',
        time: 25
      }
    ]
  },
  {
    id: 'happy',
    title: "If You're Happy and You Know It",
    idnTitle: 'Kalau Kau Suka Hati',
    icon: '😊',
    themeColor: 'from-emerald-500 to-teal-600',
    bgGradient: 'bg-emerald-50',
    accentColor: 'border-emerald-400 text-emerald-700',
    youtubeId: '71hqRT9U0wg',
    description: 'Listen to happy emotion words and action commands: clap, show, stomp!',
    questions: [
      {
        id: 1,
        before: "If you're ",
        options: ['happy', 'sad'],
        correct: 'happy',
        after: ' and you know it, clap your hands!',
        fullLine: "If you're happy and you know it, clap your hands!",
        idnExplanation: "Happy = gembira/senang! Lawan katanya adalah sad (sedih).",
        targetWord: 'happy',
        targetWordIdn: 'senang / gembira',
        time: 5
      },
      {
        id: 2,
        before: "If you're happy and you know it, ",
        options: ['clap', 'wash'],
        correct: 'clap',
        after: ' your hands!',
        fullLine: 'Clap your hands!',
        idnExplanation: "Clap your hands = tepuk tanganmu!",
        targetWord: 'clap',
        targetWordIdn: 'bertepuk tangan',
        time: 8
      },
      {
        id: 3,
        before: "If you're happy and you know it, and you really want to ",
        options: ['show', 'hide'],
        correct: 'show',
        after: ' it,',
        fullLine: 'And you really want to show it,',
        idnExplanation: "Show = menunjukkan/memperlihatkan perasaanmu!",
        targetWord: 'show',
        targetWordIdn: 'menunjukkan',
        time: 22
      },
      {
        id: 4,
        before: "If you're happy and you know it, ",
        options: ['stomp', 'sleep'],
        correct: 'stomp',
        after: ' your feet!',
        fullLine: 'Stomp your feet!',
        idnExplanation: "Stomp your feet = entakkan kakimu ke tanah!",
        targetWord: 'stomp',
        targetWordIdn: 'mengentakkan kaki',
        time: 28
      },
      {
        id: 5,
        before: "If you're happy and you know it, shout ",
        options: ['hurray', 'goodbye'],
        correct: 'hurray',
        after: '!',
        fullLine: 'Shout hurray!',
        idnExplanation: "Shout hurray = berteriak hore dengan gembira!",
        targetWord: 'shout',
        targetWordIdn: 'berteriak',
        time: 35
      }
    ]
  },
  {
    id: 'head',
    title: 'Head, Shoulders, Knees and Toes',
    idnTitle: 'Kepala Pundak Lutut Kaki',
    icon: '🧘',
    themeColor: 'from-rose-500 to-pink-600',
    bgGradient: 'bg-rose-50',
    accentColor: 'border-rose-400 text-rose-700',
    youtubeId: 'QA48wTGbU7A',
    description: 'Listen and identify human body parts: shoulders, knees, eyes, toes!',
    questions: [
      {
        id: 1,
        before: 'Head, ',
        options: ['shoulders', 'fingers'],
        correct: 'shoulders',
        after: ', knees and toes, knees and toes.',
        fullLine: 'Head, shoulders, knees and toes, knees and toes.',
        idnExplanation: "Shoulders = pundak/bahu, fingers = jari tangan.",
        targetWord: 'shoulders',
        targetWordIdn: 'pundak / bahu',
        time: 0
      },
      {
        id: 2,
        before: 'Head, shoulders, ',
        options: ['knees', 'eyes'],
        correct: 'knees',
        after: ' and toes, knees and toes.',
        fullLine: 'Head, shoulders, knees and toes, knees and toes.',
        idnExplanation: "Knees = lutut!",
        targetWord: 'knees',
        targetWordIdn: 'lutut',
        time: 4
      },
      {
        id: 3,
        before: 'And ',
        options: ['eyes', 'arms'],
        correct: 'eyes',
        after: ' and ears and mouth and nose,',
        fullLine: 'And eyes and ears and mouth and nose,',
        idnExplanation: "Eyes = mata untuk melihat!",
        targetWord: 'eyes',
        targetWordIdn: 'mata',
        time: 14
      },
      {
        id: 4,
        before: 'And eyes and ears and ',
        options: ['mouth', 'hair'],
        correct: 'mouth',
        after: ' and nose,',
        fullLine: 'And eyes and ears and mouth and nose,',
        idnExplanation: "Mouth = mulut untuk berbicara dan makan!",
        targetWord: 'mouth',
        targetWordIdn: 'mulut',
        time: 16
      },
      {
        id: 5,
        before: 'Head, shoulders, knees and ',
        options: ['toes', 'teeth'],
        correct: 'toes',
        after: '!',
        fullLine: 'Head, shoulders, knees and toes!',
        idnExplanation: "Toes = jari-jari kaki!",
        targetWord: 'toes',
        targetWordIdn: 'jari-jari kaki',
        time: 18
      }
    ]
  }
];

interface ListeningIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onWordLearned?: (word: string) => void;
  onSave?: (entry: JournalEntry) => void;
  onUnlockBadge?: (id: string) => void;
}

export const ListeningIsland: React.FC<ListeningIslandProps> = ({
  onBack,
  addPoints,
  onWordLearned,
  onSave,
  onUnlockBadge
}) => {
  const [selectedSong, setSelectedSong] = useState<ListeningSong | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [feedbackState, setFeedbackState] = useState<{
    status: 'idle' | 'correct' | 'wrong';
    selected: string;
    message?: string;
  }>({ status: 'idle', selected: '' });
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSpeakingLine, setIsSpeakingLine] = useState(false);
  const [completedSongs, setCompletedSongs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('listening_completed_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Play a pleasant chime for correct answers using Web Audio API
  const playSoundEffect = (type: 'correct' | 'wrong' | 'complete') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'correct') {
        // Upbeat major triad arpeggio (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
        });
      } else if (type === 'wrong') {
        // Gentle wobble tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'complete') {
        // Fanfare
        const chord = [523.25, 659.25, 783.99, 1046.5];
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.6);
        });
      }
    } catch (e) {
      console.warn('Audio Context tone play failed:', e);
    }
  };

  // Speak line clearly using Web Speech API
  const speakLine = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // slightly slower for clear listening
      utterance.pitch = 1.1; // warm child-friendly tone
      setIsSpeakingLine(true);
      utterance.onend = () => setIsSpeakingLine(false);
      utterance.onerror = () => setIsSpeakingLine(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentQ = selectedSong?.questions[currentQuestionIndex];

  // Auto-speak line on question open to guide child
  useEffect(() => {
    if (selectedSong && currentQ) {
      setFeedbackState({ status: 'idle', selected: '' });
      // Speak line after short entrance delay
      const timer = setTimeout(() => {
        speakLine(currentQ.fullLine);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedSong?.id, currentQuestionIndex]);

  const handleSelectSong = (song: ListeningSong) => {
    setSelectedSong(song);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);
    setIsFinished(false);
    setFeedbackState({ status: 'idle', selected: '' });
  };

  const handleAnswer = (option: string) => {
    if (!currentQ || feedbackState.status === 'correct') return;

    if (option === currentQ.correct) {
      playSoundEffect('correct');
      setFeedbackState({ status: 'correct', selected: option });
      setUserAnswers(prev => ({ ...prev, [currentQ.id]: option }));
      setScore(prev => prev + 1);

      // Add points
      addPoints(15, `Cloze Listening: ${currentQ.correct}! 🎧`);

      // Feed to Word Pantry
      if (onWordLearned) {
        onWordLearned(currentQ.targetWord);
      }

      // Progress to next question or finish
      setTimeout(() => {
        if (selectedSong && currentQuestionIndex < selectedSong.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // Finished Song!
          handleFinishSong();
        }
      }, 1600);
    } else {
      playSoundEffect('wrong');
      setFeedbackState({
        status: 'wrong',
        selected: option,
        message: `Dengarkan baik-baik ya! Toby menyanyikan "${currentQ.correct}". Coba lagi!`
      });
      // Re-play line to help child's ear
      speakLine(currentQ.fullLine);
    }
  };

  const handleFinishSong = () => {
    setIsFinished(true);
    playSoundEffect('complete');
    addPoints(50, `Lagu Selesai: ${selectedSong?.title}! 🌟`);

    if (selectedSong && !completedSongs.includes(selectedSong.id)) {
      const updated = [...completedSongs, selectedSong.id];
      setCompletedSongs(updated);
      safeSetItem('listening_completed_songs', JSON.stringify(updated));
      if (updated.length >= 3 && onUnlockBadge) {
        onUnlockBadge('melody_master');
      }
    }
  };

  const handleSaveToJournal = () => {
    if (!selectedSong || !onSave) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      type: 'song',
      english: selectedSong.title,
      indonesian: selectedSong.idnTitle,
      data: selectedSong.icon,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    onSave(entry);
    alert('Lagu berhasil disimpan ke Scrapbook petualanganmu! 📓✨');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Quicksand'] pb-20 relative select-none">
      {/* Top Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b-4 border-slate-100 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={selectedSong ? () => setSelectedSong(null) : onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span>⬅️</span>
          <span>{selectedSong ? 'DAFTAR LAGU' : 'PULAU UTAMA'}</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-800 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider">
            <span>🎧</span>
            <span>MELODY LISTENING LAGOON</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 hidden sm:block">
            {selectedSong ? selectedSong.title : 'Dengar & Tebak Kata Lagu'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-100 text-amber-800 font-black px-4 py-2 rounded-2xl text-sm flex items-center gap-1.5 border-2 border-amber-200 shadow-sm">
            <span>⭐</span>
            <span>{completedSongs.length} / {LISTENING_SONGS.length} Lagu</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedSong ? (
        /* Song Selection View */
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-[36px] p-8 md:p-10 text-white shadow-xl mb-10 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="bg-white/20 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md mb-3 inline-block">
                🎵 Interactive Cloze Listening
              </span>
              <h2 className="text-3xl md:text-5xl font-black leading-tight mb-3">
                Dengar Lagu, Tebak Kata dalam Kurung! 🎶
              </h2>
              <p className="text-violet-100 text-base md:text-lg font-medium leading-relaxed mb-6">
                Pasang telingamu, dengarkan lirik lagu anak berbahasa Inggris, lalu sentuh kata yang tepat dalam tanda kurung <span className="bg-white/20 px-2 py-0.5 rounded font-black text-white">(had / has)</span>!
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <span>👂</span> Latih Pendengaran Fonetik
                </div>
                <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <span>✨</span> Masukkan Kata ke Word Pantry
                </div>
                <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <span>🏆</span> Raih Lencana Melody Master
                </div>
              </div>
            </div>

            <div className="absolute right-4 bottom-0 opacity-20 md:opacity-40 text-9xl md:text-[180px] pointer-events-none transform translate-y-6">
              🎧
            </div>
          </div>

          {/* Song Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LISTENING_SONGS.map((song, index) => {
              const isCompleted = completedSongs.includes(song.id);
              return (
                <div
                  key={song.id}
                  onClick={() => handleSelectSong(song)}
                  className={`bg-white rounded-[32px] p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer border-4 ${
                    isCompleted ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-slate-100 hover:border-violet-300'
                  } flex flex-col justify-between group relative overflow-hidden`}
                >
                  {isCompleted && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span>✓</span> SELESAI
                    </div>
                  )}

                  <div>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${song.themeColor} flex items-center justify-center text-3xl shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                      {song.icon}
                    </div>

                    <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                      Song #{index + 1}
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-violet-600 transition-colors mb-1">
                      {song.title}
                    </h3>
                    <p className="text-sm font-bold text-violet-600 mb-3">
                      {song.idnTitle}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                      "{song.description}"
                    </p>
                  </div>

                  <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                    <div className="text-xs font-black text-slate-400 flex items-center gap-1.5">
                      <span>📝</span>
                      <span>{song.questions.length} Tebakan Lirik</span>
                    </div>

                    <button className="bg-violet-600 group-hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5">
                      <span>MAINKAN</span>
                      <span>➡️</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Song Playing / Cloze Challenge View */
        <div className="max-w-4xl mx-auto px-4 py-6">
          {!isFinished ? (
            <div className="space-y-6">
              {/* Progress & Quest Header */}
              <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedSong.themeColor} flex items-center justify-center text-2xl text-white shadow-md`}>
                    {selectedSong.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">{selectedSong.title}</h2>
                    <p className="text-xs font-bold text-slate-400">{selectedSong.idnTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-right flex-1 sm:flex-none">
                    <div className="text-xs font-black text-slate-400 uppercase">Tebakan Baris</div>
                    <div className="text-base font-black text-violet-600">
                      {currentQuestionIndex + 1} dari {selectedSong.questions.length}
                    </div>
                  </div>
                  {/* Step indicators */}
                  <div className="flex gap-1.5">
                    {selectedSong.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          idx < currentQuestionIndex
                            ? 'bg-emerald-500 scale-100'
                            : idx === currentQuestionIndex
                            ? 'bg-violet-600 ring-4 ring-violet-200 scale-110 animate-pulse'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Listening Stage Banner (Focused Listening, No Video Spoilers) */}
              <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-5 shadow-lg text-white relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                      🎧
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                          Mode Tebak Pendengaran
                        </span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                          Baris {currentQuestionIndex + 1} dari {selectedSong.questions.length}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-violet-100">
                        Dengarkan bunyi kata dengan cermat! Video musik lengkap akan terbuka setelah baris ke-5 selesai ditebak.
                      </p>
                    </div>
                  </div>

                  {/* Soundwaves visualizer animation */}
                  <div className="flex items-end gap-1 h-8 px-3 py-1 bg-white/15 rounded-xl backdrop-blur-sm">
                    <span className="w-1.5 bg-amber-300 rounded-full animate-pulse h-4" />
                    <span className="w-1.5 bg-amber-300 rounded-full animate-pulse h-7" />
                    <span className="w-1.5 bg-amber-300 rounded-full animate-pulse h-5" />
                    <span className="w-1.5 bg-amber-300 rounded-full animate-pulse h-8" />
                    <span className="w-1.5 bg-amber-300 rounded-full animate-pulse h-3" />
                  </div>
                </div>
              </div>

              {/* Cloze Challenge Arena */}
              {currentQ && (
                <div className="bg-white rounded-[36px] p-8 md:p-10 shadow-xl border-4 border-violet-100 relative overflow-hidden animate-in zoom-in-95 duration-300">
                  {/* Toby the Guide Bubble */}
                  <div className="flex items-start gap-4 mb-8 bg-violet-50 p-4 rounded-2xl border-2 border-violet-100">
                    <div className="text-4xl animate-character-breathe">🐻</div>
                    <div className="flex-1">
                      <div className="text-xs font-black text-violet-800 uppercase tracking-wider mb-1">
                        Toby's Listening Guide
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        "Dengarkan baris ini dengan cermat! Mana kata yang paling cocok di dalam tanda kurung?"
                      </p>
                    </div>

                    {/* Replay Line Button */}
                    <button
                      onClick={() => speakLine(currentQ.fullLine)}
                      disabled={isSpeakingLine}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      title="Putar Ulang Baris Ini"
                    >
                      <span className={isSpeakingLine ? 'animate-spin' : ''}>🔊</span>
                      <span>{isSpeakingLine ? 'MENDENGARKAN...' : 'PUTAR BARIS'}</span>
                    </button>
                  </div>

                  {/* The Song Lyric with Interactive Target */}
                  <div className="text-center py-6 px-4 bg-slate-50/80 rounded-3xl border-2 border-slate-100 mb-8">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                      Lirik yang Dinyanyikan:
                    </div>

                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 leading-relaxed flex flex-wrap items-center justify-center gap-2">
                      <span>{currentQ.before}</span>

                      {/* Cloze Bracket Target */}
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-100 border-4 border-dashed border-violet-400 rounded-2xl text-violet-800 shadow-inner">
                        {feedbackState.status === 'correct' ? (
                          <span className="bg-emerald-500 text-white px-4 py-1 rounded-xl text-3xl font-black shadow-md animate-bounce">
                            {currentQ.correct} ✨
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 font-black text-violet-700">
                            ( {currentQ.options[0]} / {currentQ.options[1]} )
                          </span>
                        )}
                      </span>

                      <span>{currentQ.after}</span>
                    </div>
                  </div>

                  {/* Options Buttons */}
                  <div className="space-y-4">
                    <div className="text-center text-xs font-black text-slate-400 uppercase tracking-wider">
                      PILIH KATA YANG KAMU DENGAR:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                      {currentQ.options.map(option => {
                        const isCorrectSelected = feedbackState.status === 'correct' && feedbackState.selected === option;
                        const isWrongSelected = feedbackState.status === 'wrong' && feedbackState.selected === option;

                        return (
                          <button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            disabled={feedbackState.status === 'correct'}
                            className={`p-6 rounded-3xl font-black text-2xl md:text-3xl transition-all duration-200 cursor-pointer shadow-lg flex flex-col items-center justify-center border-4 ${
                              isCorrectSelected
                                ? 'bg-emerald-500 text-white border-emerald-600 scale-105 shadow-emerald-200 ring-8 ring-emerald-100'
                                : isWrongSelected
                                ? 'bg-rose-100 text-rose-600 border-rose-400 animate-shake'
                                : 'bg-white hover:bg-violet-50 text-slate-800 border-slate-200 hover:border-violet-400 hover:scale-105 active:scale-95'
                            }`}
                          >
                            <span>{option}</span>
                            <span className="text-xs font-bold opacity-60 mt-1 uppercase tracking-wider">
                              Sentuh untuk memilih
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {feedbackState.status === 'correct' && (
                    <div className="mt-8 bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl text-center animate-in zoom-in duration-300">
                      <div className="text-2xl font-black text-emerald-700 flex items-center justify-center gap-2 mb-1">
                        <span>🎉</span>
                        <span>HEBAT! BENAR SEKALI! (+15 ⭐)</span>
                      </div>
                      <p className="text-xs font-bold text-emerald-800">
                        {currentQ.idnExplanation}
                      </p>
                      <div className="mt-2 inline-block bg-emerald-200 text-emerald-900 text-xs font-black px-3 py-1 rounded-full">
                        Kata "{currentQ.targetWord}" masuk ke Word Pantry Wordy! 🥯
                      </div>
                    </div>
                  )}

                  {feedbackState.status === 'wrong' && feedbackState.message && (
                    <div className="mt-8 bg-rose-50 border-2 border-rose-300 p-5 rounded-2xl text-center animate-in shake duration-300">
                      <div className="text-lg font-black text-rose-700 flex items-center justify-center gap-2 mb-1">
                        <span>👂</span>
                        <span>{feedbackState.message}</span>
                      </div>
                      <button
                        onClick={() => speakLine(currentQ.fullLine)}
                        className="mt-2 bg-rose-600 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow hover:bg-rose-700 cursor-pointer"
                      >
                        🔊 Dengarkan Baris Lagi
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Finished Song Celebration Screen */
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border-8 border-violet-200 text-center animate-in zoom-in duration-500 max-w-2xl mx-auto relative overflow-hidden">
              <div className="text-8xl mb-4 animate-bounce">🏆</div>

              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider mb-3">
                <span>⭐⭐⭐</span>
                <span>MELODY MASTER</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                LAGU SELESAI DITUNTASKAN!
              </h2>
              <p className="text-sm font-bold text-violet-600 mb-6">
                {selectedSong.title} ({selectedSong.idnTitle})
              </p>

              {/* Score / Stats Badge */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-6">
                <div>
                  <div className="text-3xl font-black text-emerald-600">{score} / {selectedSong.questions.length}</div>
                  <div className="text-xs font-black text-slate-400 uppercase">Tebakan Benar</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-amber-500">+{score * 15 + 50} ⭐</div>
                  <div className="text-xs font-black text-slate-400 uppercase">Total Bonus XP</div>
                </div>
              </div>

              {/* Grand Video Reward - Opens ONLY after baris ke-5 selesai ditebak! */}
              <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-xl text-left border-4 border-violet-400 mb-8 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 text-white">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                    <span>🎬</span>
                    <span>HADIAH JUARA: TONTON & NYANYIKAN LAGU UTUH!</span>
                  </div>
                  <span className="text-[11px] text-violet-200 bg-violet-800/80 px-3 py-1 rounded-full font-bold">
                    Semua 5 Baris Tuntas 🎉
                  </span>
                </div>
                
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner relative">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${selectedSong.youtubeId}?autoplay=1&rel=0`}
                    title={selectedSong.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-slate-300 font-medium mt-3 text-center">
                  🎶 Selamat! Kamu telah membuka video musik lengkap lagu ini setelah menyelesaikan tebakan kelima baris!
                </p>
              </div>

              {/* Mastered Vocabulary words summary */}
              <div className="mb-8 text-left">
                <div className="text-xs font-black text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                  <span>📚</span>
                  <span>Kata-kata yang Kamu Dengarkan Hari Ini:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSong.questions.map(q => (
                    <div
                      key={q.id}
                      className="bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-xl text-xs font-black text-violet-700 flex items-center gap-1 shadow-sm"
                    >
                      <span>✨</span>
                      <span>{q.targetWord}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({q.targetWordIdn})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSaveToJournal}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📓</span>
                  <span>SIMPAN KE SCRAPBOOK</span>
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleSelectSong(selectedSong)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-black text-sm transition-all cursor-pointer"
                  >
                    🔄 MAIN ULANG
                  </button>

                  <button
                    onClick={() => setSelectedSong(null)}
                    className="flex-2 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg transition-all cursor-pointer"
                  >
                    PILIH LAGU LAIN ➡️
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
