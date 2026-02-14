
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';

interface TimedLine {
  start: number;
  text: string;
}

interface Song {
  id: string;
  title: string;
  idnTitle: string;
  youtubeId: string;
  lyrics: string;
  timedLyrics: TimedLine[];
  icon: string;
}

const SONGS: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    idnTitle: 'Bintang Kecil',
    youtubeId: 'yCjJyiqpAuU', 
    lyrics: 'Twinkle, twinkle, little star, how I wonder what you are.',
    timedLyrics: [
      { start: 0, text: "Twinkle, twinkle, little star," },
      { start: 4, text: "How I wonder what you are." },
      { start: 8, text: "Up above the world so high," },
      { start: 12, text: "Like a diamond in the sky." },
      { start: 16, text: "Twinkle, twinkle, little star," },
      { start: 20, text: "How I wonder what you are!" }
    ],
    icon: '⭐'
  },
  {
    id: 'abc',
    title: 'The ABC Song',
    idnTitle: 'Lagu ABC',
    youtubeId: '75p-N9YKqNo',
    lyrics: 'A B C D E F G, H I J K L M N O P.',
    timedLyrics: [
      { start: 0, text: "A - B - C - D - E - F - G" },
      { start: 4, text: "H - I - J - K - L - M - N - O - P" },
      { start: 9, text: "Q - R - S, T - U - V" },
      { start: 13, text: "W - X, Y and Z" },
      { start: 17, text: "Now I know my ABCs," },
      { start: 21, text: "Next time won't you sing with me?" }
    ],
    icon: '🔤'
  },
  {
    id: 'wheels',
    title: 'The Wheels on the Bus',
    idnTitle: 'Roda Bus Berputar',
    youtubeId: 'GzrjwOQpAl0', 
    lyrics: 'The wheels on the bus go round and round, round and round.',
    timedLyrics: [
      { start: 5, text: "The wheels on the bus go round and round," },
      { start: 9, text: "Round and round, round and round." },
      { start: 13, text: "The wheels on the bus go round and round," },
      { start: 17, text: "All through the town!" },
      { start: 21, text: "The wipers on the bus go swish, swish, swish..." },
      { start: 25, text: "Swish, swish, swish, swish, swish, swish!" }
    ],
    icon: '🚌'
  },
  {
    id: 'macdonald',
    title: 'Old MacDonald Had a Farm',
    idnTitle: 'Pak MacDonald Punya Kebun',
    youtubeId: '_6HzoUcx3eo',
    lyrics: 'Old MacDonald had a farm, E-I-E-I-O!',
    timedLyrics: [
      { start: 0, text: "Old MacDonald had a farm," },
      { start: 4, text: "E-I-E-I-O!" },
      { start: 8, text: "And on his farm he had a cow," },
      { start: 12, text: "E-I-E-I-O!" },
      { start: 16, text: "With a moo-moo here," },
      { start: 18, text: "And a moo-moo there!" }
    ],
    icon: '🚜'
  },
  {
    id: 'sheep',
    title: 'Baa Baa Black Sheep',
    idnTitle: 'Domba Hitam',
    youtubeId: 'm_S6fM9y6uM',
    lyrics: 'Baa baa black sheep, have you any wool? Yes sir, yes sir, three bags full.',
    timedLyrics: [
      { start: 0, text: "Baa, baa, black sheep," },
      { start: 3, text: "Have you any wool?" },
      { start: 6, text: "Yes sir, yes sir," },
      { start: 9, text: "Three bags full!" },
      { start: 12, text: "One for the master," },
      { start: 15, text: "One for the dame," },
      { start: 18, text: "And one for the little boy" },
      { start: 21, text: "Who lives down the lane!" }
    ],
    icon: '🐑'
  },
  {
    id: 'happy',
    title: "If You're Happy and You Know It",
    idnTitle: 'Kalau Kau Suka Hati',
    youtubeId: '71hqRT9U0wg',
    lyrics: "If you're happy and you know it, clap your hands.",
    timedLyrics: [
      { start: 5, text: "If you're happy and you know it," },
      { start: 8, text: "Clap your hands! (Clap clap!)" },
      { start: 12, text: "If you're happy and you know it," },
      { start: 15, text: "Clap your hands! (Clap clap!)" },
      { start: 19, text: "If you're happy and you know it," },
      { start: 22, text: "And you really want to show it," },
      { start: 25, text: "If you're happy and you know it," },
      { start: 28, text: "Clap your hands! (Clap clap!)" }
    ],
    icon: '😊'
  },
  {
    id: 'spider',
    title: 'Itsy Bitsy Spider',
    idnTitle: 'Laba-laba Kecil',
    youtubeId: 'w_lCi8U49mY',
    lyrics: 'The itsy bitsy spider climbed up the water spout.',
    timedLyrics: [
      { start: 0, text: "The itsy bitsy spider" },
      { start: 3, text: "Climbed up the water spout." },
      { start: 7, text: "Down came the rain" },
      { start: 10, text: "And washed the spider out." },
      { start: 14, text: "Out came the sun" },
      { start: 17, text: "And dried up all the rain," },
      { start: 21, text: "And the itsy bitsy spider" },
      { start: 24, text: "Climbed up the spout again!" }
    ],
    icon: '🕷️'
  },
  {
    id: 'shark',
    title: 'Baby Shark',
    idnTitle: 'Bayi Hiu',
    youtubeId: 'XqZsoesa55w',
    lyrics: 'Baby shark, doo doo doo doo doo doo, Baby shark!',
    timedLyrics: [
      { start: 8, text: "Baby shark, doo doo doo doo doo doo" },
      { start: 12, text: "Baby shark, doo doo doo doo doo doo" },
      { start: 15, text: "Baby shark, doo doo doo doo doo doo" },
      { start: 19, text: "Baby shark!" },
      { start: 22, text: "Mommy shark, doo doo doo doo doo doo" },
      { start: 26, text: "Mommy shark!" }
    ],
    icon: '🦈'
  },
  {
    id: 'head',
    title: 'Head, Shoulders, Knees and Toes',
    idnTitle: 'Kepala Pundak Lutut Kaki',
    youtubeId: 'QA48wTGbU7A',
    lyrics: 'Head, shoulders, knees and toes, knees and toes.',
    timedLyrics: [
      { start: 0, text: "Head, shoulders, knees and toes," },
      { start: 4, text: "Knees and toes." },
      { start: 7, text: "Head, shoulders, knees and toes," },
      { start: 11, text: "Knees and toes." },
      { start: 14, text: "And eyes and ears and mouth and nose," },
      { start: 18, text: "Head, shoulders, knees and toes!" }
    ],
    icon: '🧘'
  },
  {
    id: 'boat',
    title: 'Row, Row, Row Your Boat',
    idnTitle: 'Kayuh Sampanmu',
    youtubeId: '7otAJa3jui8',
    lyrics: 'Row, row, row your boat, gently down the stream.',
    timedLyrics: [
      { start: 0, text: "Row, row, row your boat," },
      { start: 3, text: "Gently down the stream." },
      { start: 6, text: "Merrily, merrily, merrily, merrily," },
      { start: 9, text: "Life is but a dream." },
      { start: 12, text: "Row, row, row your boat," },
      { start: 15, text: "Gently down the stream." }
    ],
    icon: '🛶'
  }
];

interface SingingIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

const SingingIsland: React.FC<SingingIslandProps> = ({ onBack, addPoints }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ rating: number; feedback: string; idnFeedback: string; tips: string[] } | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [playerTime, setPlayerTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { error } = useYouTubePlayer({
    videoId: selectedSong?.youtubeId || '',
    containerId: 'song-player-container',
    onTimeUpdate: (time) => setPlayerTime(time),
    onError: (err) => setVideoError(err)
  });

  // Track current lyric index
  const currentLineIndex = selectedSong?.timedLyrics.findIndex((line, i, arr) => {
    const nextLine = arr[i + 1];
    return playerTime >= line.start && (!nextLine || playerTime < nextLine.start);
  }) ?? -1;

  // Handle automatic scrolling of lyrics
  useEffect(() => {
    if (currentLineIndex !== -1) {
      const el = document.getElementById(`lyric-line-${currentLineIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size > 500) {
          setAudioBlob(blob);
        } else {
          alert("Toby couldn't hear you! Try again. (Toby tidak dengar suaramu! Coba lagi ya.)");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      alert("Please allow microphone access! (Izinkan akses mikrofon ya!)");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeSinging = async () => {
    if (!audioBlob || !selectedSong) return;
    setIsAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(audioBlob);
      });
      const base64Audio = await base64Promise;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: base64Audio } },
          {
            text: `You are Toby the Bear. Listen to the child singing: "${selectedSong.lyrics}". 
            Give fun feedback. JSON: { "rating": 1-5, "feedback": "string", "idnFeedback": "string", "tips": ["word1"] }`
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rating: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              idnFeedback: { type: Type.STRING },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['rating', 'feedback', 'idnFeedback', 'tips']
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setFeedback(result);
      addPoints(result.rating * 10, `Singing Star! ${'⭐'.repeat(result.rating)}`);
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      alert("Toby had a hiccup. Try again! (Ada masalah, coba lagi ya!)");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative min-h-[70vh]">
      <button onClick={onBack} className="mb-6 text-rose-600 font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
        ⬅️ Back to Map (Kembali)
      </button>

      {!selectedSong ? (
        <div className="text-center">
          <h2 className="text-4xl font-black text-rose-600 mb-2 animate-character-breathe inline-block">
             <span className="animate-character-blink block">Singing Stage! 🎤</span>
          </h2>
          <p className="text-gray-500 mb-8 italic">Choose a song and sing your heart out! (Pilih lagu dan bernyanyilah!)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {SONGS.map(song => (
              <button
                key={song.id}
                onClick={() => setSelectedSong(song)}
                className="bg-white p-8 rounded-[40px] shadow-xl hover:scale-105 transition-all border-b-8 border-rose-100 flex items-center gap-6 group"
              >
                <div className="text-6xl group-hover:rotate-12 transition-transform">{song.icon}</div>
                <div className="text-left">
                  <div className="font-black text-xl text-rose-600 leading-tight">{song.title}</div>
                  <div className="text-gray-400 font-bold text-sm">{song.idnTitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full bg-white rounded-[50px] shadow-2xl overflow-hidden border-8 border-rose-100 mb-6 relative">
            <div className="aspect-video w-full bg-black flex items-center justify-center relative">
              <div id="song-player-container" className="w-full h-full"></div>
              
              {(videoError || error) && (
                <div className="absolute inset-0 bg-gray-900/95 text-white p-8 flex flex-col items-center justify-center text-center z-20">
                  <span className="text-6xl mb-4">📺</span>
                  <h3 className="text-xl font-black mb-2">Watch Video on YouTube</h3>
                  <p className="text-sm opacity-80 mb-6">YouTube blocks this video here. Click below to watch it, then use the lyrics below to sing!</p>
                  <a href={`https://www.youtube.com/watch?v=${selectedSong.youtubeId}`} target="_blank" className="bg-rose-500 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all mb-4">Open YouTube 🔗</a>
                  <button onClick={() => setSelectedSong(null)} className="bg-gray-700 px-6 py-2 rounded-full text-xs">Pick Another Song</button>
                </div>
              )}
            </div>
          </div>

          {/* Karaoke Lyrics Display */}
          <div className="w-full bg-white rounded-[40px] shadow-xl p-4 mb-10 border-4 border-rose-200 text-center animate-in slide-in-from-bottom-5 relative overflow-hidden h-[300px]">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:20px_20px]"></div>
            
            <div className="space-y-4 relative z-10 h-full overflow-y-auto custom-scrollbar p-6" id="lyrics-scroll-container">
              {selectedSong.timedLyrics.map((line, i) => {
                const isPast = currentLineIndex !== -1 && i < currentLineIndex;
                const isCurrent = currentLineIndex === i;
                const isFuture = currentLineIndex !== -1 && i > currentLineIndex;

                return (
                  <div 
                    key={i} 
                    id={`lyric-line-${i}`}
                    className={`py-4 px-6 rounded-3xl transition-all duration-700 transform flex items-center justify-center gap-4 ${
                      isCurrent 
                        ? 'bg-rose-500 text-white scale-105 shadow-[0_0_25px_rgba(225,29,72,0.5)] ring-4 ring-rose-200 font-black text-3xl' 
                        : isPast 
                          ? 'bg-green-50 text-green-500 scale-95 opacity-60 font-bold text-xl' 
                          : 'text-gray-300 font-bold text-xl opacity-30'
                    }`}
                  >
                    <span className="flex-1">{line.text}</span>
                    {isPast && <span className="text-2xl animate-in zoom-in">✅</span>}
                    {isCurrent && <span className="text-2xl animate-bounce">🎤</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="flex flex-col items-center gap-4">
              {!isRecording && !audioBlob && (
                <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={startRecording} 
                    className="w-24 h-24 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 border-8 border-rose-100 group transition-all"
                  >
                    <span className="text-4xl group-hover:rotate-12 transition-transform">🎤</span>
                  </button>
                  <span className="text-rose-600 font-black text-sm uppercase animate-pulse">Click to Start Singing!</span>
                </div>
              )}

              {isRecording && (
                <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={stopRecording} 
                    className="w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl animate-pulse border-8 border-red-100"
                  >
                    <span className="text-4xl">⏹️</span>
                  </button>
                  <span className="text-red-600 font-black text-sm uppercase">Singing Now...</span>
                </div>
              )}
            </div>

            {audioBlob && !isAnalyzing && !feedback && (
              <div className="flex flex-col items-center gap-4 animate-in zoom-in w-full">
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={analyzeSinging} 
                    className="flex-1 bg-green-500 text-white py-5 rounded-3xl font-black text-xl shadow-lg hover:bg-green-600 hover:scale-105 transition-all"
                  >
                    HOW DID I DO? ✨
                  </button>
                  <button 
                    onClick={() => setAudioBlob(null)} 
                    className="bg-gray-200 text-gray-500 px-8 py-5 rounded-3xl font-black shadow-md hover:bg-gray-300"
                  >
                    RETRY
                  </button>
                </div>
                <audio src={URL.createObjectURL(audioBlob)} controls className="w-full opacity-60" />
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-rose-600 font-black text-lg">Toby is checking your singing! 🐻👂</p>
              </div>
            )}

            {feedback && (
              <div className="bg-white w-full p-8 rounded-[40px] shadow-2xl border-4 border-rose-400 text-center animate-in zoom-in relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-6xl">
                  {feedback.rating >= 4 ? '🌟' : '👏'}
                </div>
                <div className="flex justify-center gap-1 mb-4 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-4xl ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-200'}`}>⭐</span>
                  ))}
                </div>
                <p className="text-2xl font-black text-gray-800 leading-tight mb-2">"{feedback.feedback}"</p>
                <p className="text-sm italic text-gray-500 mb-6">"{feedback.idnFeedback}"</p>
                
                {feedback.tips.length > 0 && (
                   <div className="mb-6 p-5 bg-rose-50 rounded-2xl text-left border-2 border-rose-100 shadow-inner">
                      <p className="text-[12px] font-black text-rose-400 uppercase mb-2 tracking-widest">Toby's Voice Tips:</p>
                      <p className="text-lg font-bold text-rose-700">Practice these words: <span className="underline decoration-wavy decoration-rose-400 underline-offset-4">{feedback.tips.join(", ")}</span></p>
                   </div>
                )}

                <button
                  onClick={() => { setSelectedSong(null); setFeedback(null); setAudioBlob(null); }}
                  className="w-full bg-rose-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg hover:bg-rose-700 active:scale-95 transition-all"
                >
                  PICK ANOTHER SONG 🎵
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fecdd3;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fda4af;
        }
      `}</style>
    </div>
  );
};

export default SingingIsland;
