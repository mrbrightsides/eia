import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playPronunciation, translateStoryMagic, MagicTranslationResult } from '../services/geminiService';
import { JournalEntry, UserProfile, IslandMastery } from '../types';

interface TranslatorIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  onWordLearned?: (word: string) => void;
  profile?: UserProfile | null;
  masteryScore?: number;
  masteryLevel?: IslandMastery;
  onUnlockBadge?: (badgeId: string) => void;
  points?: number;
  streak?: number;
}

const STORY_STARTERS = [
  {
    icon: '🏖️',
    title: 'Pantai Impian',
    text: 'Kemarin aku dan keluargaku pergi ke pantai yang indah. Kami membangun istana pasir yang megah dan bermain ombak bersama adikku.'
  },
  {
    icon: '🚀',
    title: 'Roket Luar Angkasa',
    text: 'Aku bermimpi terbang ke luar angkasa menaiki roket perak. Dari jendela, aku melihat bintang-bintang berkelap-kelip dan planet yang berwarna-warni.'
  },
  {
    icon: '🐱',
    title: 'Kucing Ajaib',
    text: 'Kucingku bernama Miko memiliki bulu putih lembut dan mata yang bersinar. Dia sangat suka bermain bola benang dan tidur di sampingku.'
  },
  {
    icon: '🍕',
    title: 'Pizza Lezat',
    text: 'Hari ini aku membantu Ibu membuat pizza di dapur. Kami menaburkan banyak keju leleh, sosis gurih, dan saus tomat yang manis.'
  },
  {
    icon: '🌳',
    title: 'Pohon Rahasia',
    text: 'Di belakang rumahku ada pohon rindang tempat burung bernyanyi setiap pagi. Di bawah pohon itu, aku suka membaca buku cerita favoritku.'
  }
];

const STORY_TONES = [
  { id: 'natural', label: '🌟 Natural & Jelas', desc: 'Gaya percakapan sehari-hari yang ramah' },
  { id: 'fairytale', label: '🧚 Dongeng Ajaib', desc: 'Penuh pesona seperti cerita dongeng kerajaan' },
  { id: 'superhero', label: '🦸 Pahlawan Super', desc: 'Penuh semangat dan aksi kepahlawanan' },
  { id: 'funny', label: '🤪 Lucu & Ceria', desc: 'Bumbu kata yang menggemaskan dan menghibur' },
  { id: 'adventure', label: '🏴‍☠️ Petualangan', desc: 'Gaya penjelajah hutan dan lautan misteri' }
];

const TranslatorIsland: React.FC<TranslatorIslandProps> = ({
  onBack,
  addPoints,
  onSave,
  onWordLearned,
  profile,
  masteryScore = 0,
  masteryLevel = { percent: 0, level: 'Novice', idnLevel: 'Pemula', color: 'bg-green-500' },
  onUnlockBadge,
  points = 0,
  streak = 0
}) => {
  const [inputText, setInputText] = useState('');
  const [direction, setDirection] = useState<'id-to-en' | 'en-to-id'>('id-to-en');
  const [selectedTone, setSelectedTone] = useState('natural');
  const [translationResult, setTranslationResult] = useState<MagicTranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [learnedWordsList, setLearnedWordsList] = useState<string[]>(() => profile?.learnedWords || []);
  const [isSpeechListening, setIsSpeechListening] = useState(false);
  const [storiesCount, setStoriesCount] = useState<number>(() => {
    const saved = localStorage.getItem('magic_stories_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showBadgeToast, setShowBadgeToast] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const lastTranslatedTextRef = useRef<string>('');

  // Sync learnedWordsList with profile
  useEffect(() => {
    if (profile?.learnedWords) {
      setLearnedWordsList(profile.learnedWords);
    }
  }, [profile?.learnedWords]);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = direction === 'id-to-en' ? 'id-ID' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsSpeechListening(false);
      };

      recognition.onerror = () => {
        setIsSpeechListening(false);
      };

      recognition.onend = () => {
        setIsSpeechListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [direction]);

  const handleToggleSpeech = () => {
    if (!recognitionRef.current) {
      alert("Browser kamu belum mendukung input suara langsung. Yuk ketik ceritamu di kotak teks!");
      return;
    }

    if (isSpeechListening) {
      recognitionRef.current.stop();
      setIsSpeechListening(false);
    } else {
      try {
        recognitionRef.current.lang = direction === 'id-to-en' ? 'id-ID' : 'en-US';
        recognitionRef.current.start();
        setIsSpeechListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Perform translation
  const performTranslation = async (text: string, tone: string, dir: 'id-to-en' | 'en-to-id') => {
    if (!text.trim()) {
      setTranslationResult(null);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateStoryMagic(text.trim(), tone, dir);
      setTranslationResult(result);

      // If this is a substantial new translation, reward progress
      if (text.trim().length > 15 && text.trim() !== lastTranslatedTextRef.current) {
        lastTranslatedTextRef.current = text.trim();
        const newCount = storiesCount + 1;
        setStoriesCount(newCount);
        localStorage.setItem('magic_stories_count', newCount.toString());

        addPoints(25, "Translated Story with Magic Quill! 🪄✨");

        // Unlock storyteller badge after 3 stories
        if (newCount >= 3) {
          onUnlockBadge?.('storyteller');
          setShowBadgeToast(true);
          setTimeout(() => setShowBadgeToast(false), 4000);
        }
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Live typing debouncing (automatically translate like Google Translate)
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!inputText.trim()) {
      setTranslationResult(null);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performTranslation(inputText, selectedTone, direction);
    }, 650);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputText, selectedTone, direction]);

  const handleCopy = () => {
    if (!translationResult?.translatedText) return;
    navigator.clipboard.writeText(translationResult.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAudio = async () => {
    if (!translationResult?.translatedText || isPlayingAudio) return;
    setIsPlayingAudio(true);
    await playPronunciation(translationResult.translatedText);
    setTimeout(() => setIsPlayingAudio(false), 2500);
  };

  const handleSaveToJournal = () => {
    if (!translationResult || !onSave) return;
    onSave({
      type: 'story',
      english: translationResult.translatedText.slice(0, 100) + '...',
      indonesian: inputText.slice(0, 100) + '...',
      data: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd8?auto=format&fit=crop&w=600&q=80'
    });
    setSavedSuccess(true);
    addPoints(30, "Saved Story to Scrapbook! 📖⭐");
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddLearnedWord = (wordObj: { word: string; meaning: string; emoji: string }) => {
    if (learnedWordsList.includes(wordObj.word)) return;
    setLearnedWordsList((prev) => [...prev, wordObj.word]);
    if (onWordLearned) {
      onWordLearned(wordObj.word);
    }
    addPoints(10, `Added "${wordObj.word}" to Word Pantry! 🍎`);
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col items-center">
      {/* Top Bar Navigation & Progress Consistency Strip */}
      <div className="w-full flex flex-wrap justify-between items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="bg-white border-2 border-slate-200 px-5 py-2.5 rounded-2xl text-blue-600 font-extrabold shadow-sm hover:bg-slate-50 hover:-translate-x-1 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>⬅️</span> Back to Map
        </button>

        {/* Central Island Mastery & Progress Tracker */}
        <div className="bg-white px-5 py-2 rounded-2xl border-2 border-indigo-100 shadow-sm flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪄</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800">Mastery:</span>
                <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-md ${masteryLevel.color}`}>
                  {masteryLevel.idnLevel} ({masteryScore}%)
                </span>
              </div>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${Math.min(masteryScore, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
            <span>📚</span>
            <span>{storiesCount} Cerita</span>
          </div>
        </div>

        {/* Direction Switcher */}
        <div className="bg-white p-1.5 rounded-2xl border-2 border-indigo-100 shadow-sm flex items-center gap-2">
          <button
            onClick={() => setDirection('id-to-en')}
            className={`px-4 py-1.5 rounded-xl font-black text-sm transition-all cursor-pointer ${
              direction === 'id-to-en'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            🇮🇩 Indo ➡️ 🇬🇧 English
          </button>
          <button
            onClick={() => setDirection('en-to-id')}
            className={`px-4 py-1.5 rounded-xl font-black text-sm transition-all cursor-pointer ${
              direction === 'en-to-id'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            🇬🇧 English ➡️ 🇮🇩 Indo
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-[35px] p-6 md:p-8 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-9xl opacity-20 pointer-events-none select-none">
          ✍️
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              ✨ Live Story Translator &bull; +25 XP
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Pena Ajaib: Magic Quill 🪄
            </h1>
            <p className="text-indigo-100 font-medium text-sm md:text-base mt-1 max-w-xl">
              Tuliskan cerita Bahasa Indonesia atau gunakan ide dongeng, dan saksikan Toby menerjemahkannya secara otomatis ke Bahasa Inggris!
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center gap-3 self-start md:self-auto">
            <span className="text-3xl animate-bounce">🐻</span>
            <div className="text-xs">
              <p className="font-extrabold text-amber-200">Toby's Quick Tip</p>
              <p className="text-white/90">Simpan cerita ke Scrapbook untuk +30 ⭐!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Unlocked Celebration Toast */}
      <AnimatePresence>
        {showBadgeToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 border-4 border-white p-4 rounded-3xl shadow-2xl mb-6 text-white flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-bounce">🏆</span>
              <div>
                <h4 className="font-black text-lg leading-tight">Lencana Baru Terbuka: Magic Storyteller! 🪄</h4>
                <p className="text-xs text-amber-100 font-bold">
                  Hebat! Kamu telah menulis dan menerjemahkan dongeng ajaib!
                </p>
              </div>
            </div>
            <span className="bg-white text-orange-600 px-3 py-1 rounded-xl text-xs font-black">
              +100 XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tone Style Selector */}
      <div className="w-full mb-6">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
          <span>🎭</span> Pilih Gaya / Mood Cerita:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {STORY_TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                selectedTone === tone.id
                  ? 'bg-white border-indigo-500 shadow-md scale-[1.02] ring-2 ring-indigo-200'
                  : 'bg-white/80 border-slate-200 hover:border-indigo-300 hover:bg-white text-slate-700'
              }`}
            >
              <div className="font-black text-sm text-slate-800">{tone.label}</div>
              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{tone.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Story Starters Quick Inspiration */}
      <div className="w-full mb-6">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
          <span>💡</span> Ide Cerita Cepat (Klik untuk mencoba):
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STORY_STARTERS.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(starter.text)}
              className="flex-none bg-white hover:bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-300 px-4 py-2 rounded-2xl text-xs font-extrabold text-indigo-900 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{starter.icon}</span>
              <span>{starter.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual Box Area (Split Live Translate) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Indonesian Input Area */}
        <div className="bg-white rounded-[32px] border-4 border-indigo-100 shadow-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{direction === 'id-to-en' ? '🇮🇩' : '🇬🇧'}</span>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">
                    {direction === 'id-to-en' ? 'Bahasa Indonesia' : 'English Text'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">
                    {direction === 'id-to-en' ? 'Tulis ceritamu di sini' : 'Type your story here'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Voice / Clear */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSpeech}
                  title="Gunakan Suara (Bicara langsung)"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer ${
                    isSpeechListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-md'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {isSpeechListening ? '⏹️' : '🎤'}
                </button>
                {inputText && (
                  <button
                    onClick={() => setInputText('')}
                    title="Hapus Teks"
                    className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>

            {/* Input Textarea */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  direction === 'id-to-en'
                    ? 'Tulis satu kalimat, paragraf, atau dongeng buatanmu... (Misal: Kemarin aku pergi ke kebun binatang bersama sahabatku...)'
                    : 'Write a sentence or paragraph in English to translate...'
                }
                rows={7}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none transition-all resize-none text-base leading-relaxed"
              />

              {isSpeechListening && (
                <div className="absolute bottom-4 left-4 bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Mendengarkan suaramu...
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-400">
            <div>
              <span>{wordCount} Kata</span> &bull; <span>{inputText.length} Karakter</span>
            </div>
            {isTranslating ? (
              <span className="text-indigo-600 flex items-center gap-1 animate-pulse font-black">
                <span className="inline-block animate-spin">🪄</span> Toby sedang menerjemahkan...
              </span>
            ) : (
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <span>⚡</span> Live Translate Aktif
              </span>
            )}
          </div>
        </div>

        {/* Right Box: Live Translation Output Card */}
        <div className="bg-white rounded-[32px] border-4 border-purple-200 shadow-xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{direction === 'id-to-en' ? '🇬🇧' : '🇮🇩'}</span>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">
                    {direction === 'id-to-en' ? 'English Story' : 'Terjemahan Indonesia'}
                  </h3>
                  <span className="text-[11px] text-purple-600 font-bold uppercase">
                    Hasil Terjemahan Ajaib ✨
                  </span>
                </div>
              </div>

              {/* Action Controls: Audio & Copy */}
              <div className="flex items-center gap-2">
                {translationResult?.translatedText && (
                  <>
                    <button
                      onClick={handlePlayAudio}
                      disabled={isPlayingAudio}
                      title="Dengarkan Pengucapan (Toby Speaks)"
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>{isPlayingAudio ? '🔊' : '🗣️'}</span>
                      <span>Dengar</span>
                    </button>
                    <button
                      onClick={handleCopy}
                      title="Salin Terjemahan"
                      className="bg-purple-100 hover:bg-purple-200 text-purple-900 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>{copied ? '✅' : '📋'}</span>
                      <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Translation Output Container */}
            <div className="min-h-[170px] bg-gradient-to-br from-purple-50/70 to-indigo-50/50 rounded-2xl p-5 border-2 border-dashed border-purple-200 flex flex-col justify-center relative">
              {isTranslating && !translationResult ? (
                <div className="text-center py-8">
                  <div className="text-4xl animate-bounce mb-2">🪄</div>
                  <p className="text-purple-600 font-black text-sm">Menyusun sihir kata dalam Bahasa Inggris...</p>
                </div>
              ) : translationResult?.translatedText ? (
                <div>
                  <p className="text-slate-800 text-lg md:text-xl font-extrabold leading-relaxed font-sans select-text">
                    "{translationResult.translatedText}"
                  </p>
                  
                  {/* Subtle word helper reminder */}
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-purple-600 font-bold">
                    <span>💡</span>
                    <span>Toby telah menyaring kosa kata baru di bawah!</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <span className="text-4xl block mb-2 opacity-50">✨</span>
                  <p className="font-bold text-sm">Tuliskan ceritamu di sebelah kiri,</p>
                  <p className="text-xs">dan terjemahan ajaib akan muncul otomatis di sini!</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions: Save to Scrapbook */}
          {translationResult?.translatedText && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                  Mood: {selectedTone.toUpperCase()}
                </span>
              </div>

              <button
                onClick={handleSaveToJournal}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2 rounded-2xl font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{savedSuccess ? '🌟 Tersimpan!' : '📓 Simpan ke Scrapbook'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vocabulary Breakdown Section & Toby Note */}
      {translationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-8 space-y-6"
        >
          {/* Key Words / Kosa Kata Ajaib */}
          {translationResult.keyWords && translationResult.keyWords.length > 0 && (
            <div className="bg-white rounded-[32px] border-4 border-amber-200 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🪄</span>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Kosa Kata Ajaib Dari Ceritamu</h3>
                    <p className="text-xs text-slate-500 font-bold">
                      Klik kata untuk mendengar suaranya atau simpan ke lemari makan Wordy!
                    </p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full">
                  {translationResult.keyWords.length} Words Found
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {translationResult.keyWords.map((kw, i) => {
                  const isLearned = learnedWordsList.includes(kw.word);
                  return (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 border-2 border-amber-200/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{kw.emoji || '✨'}</span>
                            <div>
                              <h4 className="font-black text-slate-800 text-base group-hover:text-amber-700 transition-colors">
                                {kw.word}
                              </h4>
                              <span className="text-[10px] bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded-md uppercase">
                                {kw.partOfSpeech || 'Word'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => playPronunciation(kw.word)}
                            title="Dengarkan Suara"
                            className="w-8 h-8 rounded-xl bg-white text-amber-800 shadow-sm border border-amber-200 flex items-center justify-center text-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                          >
                            🔊
                          </button>
                        </div>

                        <p className="text-sm font-bold text-slate-600 mb-1">
                          🇮🇩 {kw.meaning}
                        </p>
                        {kw.example && (
                          <p className="text-xs text-slate-500 italic mt-1 bg-white/70 p-2 rounded-xl border border-amber-100">
                            "{kw.example}"
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddLearnedWord(kw)}
                        disabled={isLearned}
                        className={`mt-3 w-full py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isLearned
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-sm hover:scale-102 active:scale-98'
                        }`}
                      >
                        <span>{isLearned ? '✅ Di Lemari Kata' : '🍎 Beri Makan Wordy (+10 XP)'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toby's Encouragement & Fun Tip Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border-3 border-emerald-200 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl flex-none shadow-sm">
                🐻
              </div>
              <div>
                <h4 className="font-black text-emerald-900 text-sm uppercase tracking-wide mb-1">
                  Catatan Semangat Dari Toby
                </h4>
                <p className="text-emerald-800 text-sm font-bold leading-snug">
                  "{translationResult.tobyNote}"
                </p>
              </div>
            </div>

            <div className="bg-sky-50 border-3 border-sky-200 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-2xl flex-none shadow-sm">
                💡
              </div>
              <div>
                <h4 className="font-black text-sky-900 text-sm uppercase tracking-wide mb-1">
                  English Fun Fact / Tips
                </h4>
                <p className="text-sky-800 text-sm font-bold leading-snug">
                  {translationResult.funFact}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TranslatorIsland;
