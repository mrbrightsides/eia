
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { startChatSession, translateToIndonesian } from '../services/geminiService';

interface ChatIslandProps {
  onBack: () => void;
  points: number;
  streak: number;
  addPoints: (amount: number, reason: string) => void;
  avatar: string;
}

const ChatIsland: React.FC<ChatIslandProps> = ({ onBack, points, streak, addPoints, avatar }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! Halo! I am Toby. How are you today? Kamu apa kabar?" }
  ]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMagic, setIsMagic] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const achievementContext = streak > 1 ? `The user is on a ${streak} day streak! Praise them! ` : "";
    const pointContext = points > 500 ? `The user has over ${points} points! ` : "";

    chatRef.current = startChatSession(
      "You are Toby, a friendly cartoon bear who teaches English to Indonesian children. " +
      achievementContext + pointContext +
      "Speak simply and use emojis. " +
      "GRAMMAR RULE: If the user makes a mistake in English, respond to their message first. " +
      "THEN, at the very end of your response, add a section starting exactly with 'TOBY_TIP:' followed by: " +
      "1. The corrected English sentence. 2. A pipe symbol '|'. 3. The Indonesian translation of that sentence. 4. Another pipe symbol '|'. 5. A gentle encouragement. " +
      "Example: 'TOBY_TIP: I like apples. | Saya suka apel. | Great try! Keep going!'" +
      "IMPORTANT: No asterisks. Keep text clean."
    );
    
    if (streak > 2 || points > 1000) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `WOW! Look at you! Kamu hebat! You have ${points} points and a ${streak} day streak! You are a superstar! ⭐` 
        }]);
      }, 500);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.toLowerCase();
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput("");
    setIsTyping(true);

    // Interaction Reward
    const newMessageCount = messageCount + 1;
    setMessageCount(newMessageCount);
    if (newMessageCount % 3 === 0) {
      addPoints(15, "Conversationalist Reward! 🐻💬");
    }

    if (userMsg.includes("magic")) {
      setIsMagic(true);
      setTimeout(() => setIsMagic(false), 3000);
    }

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Oh no! My honey jar fell. Let's try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTranslate = async (index: number, text: string) => {
    // Strip the tip before translating if needed
    const cleanText = text.split('TOBY_TIP:')[0].trim();
    if (translations[index] || translatingIdx !== null) return;
    
    setTranslatingIdx(index);
    const translation = await translateToIndonesian(cleanText);
    setTranslations(prev => ({ ...prev, [index]: translation }));
    setTranslatingIdx(null);
    addPoints(2, "Using Magic Dictionary! 📖");
  };

  const renderMessageContent = (msg: Message, idx: number) => {
    if (msg.role === 'user') return msg.text;

    const parts = msg.text.split('TOBY_TIP:');
    const mainText = parts[0].trim();
    const tipData = parts[1] ? parts[1].split('|').map(s => s.trim()) : null;

    return (
      <div className="flex flex-col gap-3">
        <p>{mainText}</p>
        
        {tipData && tipData.length >= 3 && (
          <div className="mt-2 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 shadow-sm animate-in zoom-in duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl animate-character-breathe">
                <span className="animate-character-blink block">🐾</span>
              </span>
              <span className="text-xs font-black text-yellow-700 uppercase tracking-widest">Toby's Learning Tip</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-bold text-gray-800">
                Correct: <span className="text-blue-600">"{tipData[0]}"</span>
              </div>
              <div className="text-xs text-gray-500 italic">
                Artinya: {tipData[1]}
              </div>
              <div className="text-[10px] font-black text-green-600 uppercase bg-green-50 self-start px-2 py-0.5 rounded-md">
                ✨ {tipData[2]}
              </div>
            </div>
          </div>
        )}

        {msg.role === 'model' && (
          <div className="flex items-center gap-2 mt-2">
            <button 
              onClick={() => handleTranslate(idx, msg.text)}
              className={`w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-95 ${translations[idx] ? 'bg-green-500 text-white' : 'bg-orange-400 text-white hover:bg-orange-500'}`}
              title="Magic Translate"
              disabled={translatingIdx === idx}
            >
              {translatingIdx === idx ? '⏳' : translations[idx] ? '✅' : '🇮🇩'}
            </button>
            {translations[idx] && (
              <span className="text-[10px] font-bold text-orange-400 uppercase">Translated!</span>
            )}
          </div>
        )}

        {translations[idx] && (
          <div className="mt-2 pt-2 border-t border-orange-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm italic text-gray-500 bg-orange-50/50 p-3 rounded-2xl">
              {translations[idx]}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-2xl mx-auto p-4 flex flex-col h-[80vh] transition-all duration-500 relative ${isMagic ? 'scale-105' : ''}`}>
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
         <div className="absolute top-10 left-10 animate-float-slow text-4xl">🐝</div>
         <div className="absolute bottom-20 right-10 animate-float-slow text-4xl" style={{ animationDelay: '2s' }}>🍯</div>
         <div className="absolute top-1/2 left-20 animate-float-slow text-2xl" style={{ animationDelay: '1s' }}>🌻</div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-blue-600 font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform">⬅️ Back</button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-2xl border-2 border-orange-200">
                <span className="animate-character-breathe">
                   <span className="animate-character-blink block">🐻</span>
                </span>
             </div>
             <button 
                onClick={() => { setIsDancing(true); setTimeout(() => setIsDancing(false), 2000); }}
                className="bg-orange-100 px-4 py-1 rounded-full text-orange-600 font-bold border-2 border-orange-200 relative group active:scale-95 transition-all"
              >
                {streak > 3 && <span className="absolute -top-4 -left-2 text-2xl animate-pulse">👑</span>}
                Chat with Toby
              </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto bg-white/90 backdrop-blur rounded-[40px] shadow-2xl p-6 mb-4 space-y-4 relative ${isMagic ? 'border-4 border-yellow-400' : 'border-4 border-orange-50'}`}>
          {isDancing && <div className="absolute inset-0 z-50 flex items-center justify-center text-6xl animate-bounce pointer-events-none">❤️ ❤️ ❤️</div>}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center border shadow-sm ${msg.role === 'user' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                 <span className="animate-character-breathe">
                    <span className="animate-character-blink block text-sm">{msg.role === 'user' ? avatar : '🐻'}</span>
                 </span>
              </div>
              <div className={`max-w-[85%] p-5 rounded-3xl text-lg leading-relaxed shadow-sm transition-all animate-in slide-in-from-bottom-2 relative group ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border-2 border-orange-100 text-gray-800 rounded-tl-none'}`}>
                {renderMessageContent(msg, idx)}
              </div>
            </div>
          ))}
          {isTyping && <div className="flex justify-start items-center gap-2 animate-pulse p-4 text-orange-400 font-black italic">
             <span className="animate-character-breathe">
                <span className="animate-character-blink block text-xl">🐻</span>
             </span>
             Toby is thinking... 🍯
          </div>}
          <div ref={scrollRef} />
        </div>

        <div className="flex gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder="Talk to Toby... (Bicara dengan Toby...)" 
            className="flex-1 p-5 rounded-3xl border-4 border-orange-50 shadow-inner outline-none focus:border-orange-200 bg-white/80 backdrop-blur transition-all text-lg font-medium"
          />
          <button onClick={handleSend} disabled={isTyping} className="bg-orange-500 text-white px-8 rounded-3xl font-black text-xl shadow-lg hover:bg-orange-600 disabled:opacity-50 active:scale-95 transition-all">SEND</button>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ChatIsland;
