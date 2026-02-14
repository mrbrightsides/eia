
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { startChatSession } from '../services/geminiService';

interface QuestInfo {
  id: string;
  title: string;
  idnTitle: string;
  description: string;
  startMessage: string;
  icon: string;
  color: string;
}

const QUESTS: QuestInfo[] = [
  {
    id: 'magic_key',
    title: 'The Magic Key',
    idnTitle: 'Kunci Ajaib',
    description: 'Help Mayor Hoot find the golden key hidden in the library!',
    startMessage: "Hoot hoot! Welcome, brave explorer. I am Mayor Hoot. A mysterious fog has covered our library! Can you help me find the 'MAGIC KEY'? It is small, shiny, and made of gold. Tell me, where should we look first? On the bookshelf or under the table?",
    icon: '🗝️',
    color: 'bg-indigo-600'
  },
  {
    id: 'silent_piano',
    title: 'The Silent Piano',
    idnTitle: 'Piano yang Diam',
    description: 'The school piano stopped playing music! Solve the musical mystery.',
    startMessage: "Greetings! I am Professor Paws. My grand piano is silent! I think a 'STUCK NOTE' is the problem. Should we check inside the piano or look at the pedals? What do you think, young musician?",
    icon: '🎹',
    color: 'bg-rose-600'
  },
  {
    id: 'missing_rainbow',
    title: 'The Missing Rainbow',
    idnTitle: 'Pelangi yang Hilang',
    description: 'The colors of the island rainbow are fading. Help Sparkle the Unicorn!',
    startMessage: "Hello! I'm Sparkle. Oh no! My rainbow is losing its 'RED' and 'BLUE' colors. We need to find something colorful to fix it. Can you find a red fruit or a blue flower nearby? Tell me what you see!",
    icon: '🌈',
    color: 'bg-sky-600'
  }
];

interface RoleplayIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

const RoleplayIsland: React.FC<RoleplayIslandProps> = ({ onBack, addPoints }) => {
  const [selectedQuest, setSelectedQuest] = useState<QuestInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const startQuest = (quest: QuestInfo) => {
    setSelectedQuest(quest);
    setMessages([{ role: 'model', text: quest.startMessage }]);
    
    chatRef.current = startChatSession(
      `You are ${quest.id === 'magic_key' ? 'Mayor Hoot (an owl)' : quest.id === 'silent_piano' ? 'Professor Paws (a cat)' : 'Sparkle (a unicorn)'}. ` +
      `The user is helping you solve this mystery: ${quest.description}. ` +
      "RULES: " +
      "1. Be very friendly and use child-friendly English. " +
      "2. If the user answers correctly or makes a good guess, advance the story slightly. " +
      "3. CRITICAL: If the user gives a wrong answer, doesn't understand, or answers in Indonesian, do NOT just say 'wrong'. " +
      "Instead, give a very clear CLUE in English to help them. " +
      "Example Clue: 'Hoot! Not there, but I see something shiny near the big RED books! What is it?' " +
      "4. Keep responses short (2-3 sentences max). " +
      "5. Use occasional emojis matching your character."
    );
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !selectedQuest) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      addPoints(15, "Roleplay Progress! ✨");
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Oh my! Something went wrong in our adventure. Let's try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!selectedQuest) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex flex-col items-center min-h-[70vh]">
        <button onClick={onBack} className="self-start text-indigo-600 font-bold mb-8 flex items-center gap-2">
          ⬅️ Back to Map
        </button>
        <h2 className="text-4xl font-black text-indigo-600 mb-2 animate-bounce-slow">NPC Quests! 🦉</h2>
        <p className="text-gray-500 mb-10 italic">Help our friends solve island mysteries! (Bantu teman kita memecahkan misteri!)</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {QUESTS.map(quest => (
            <button
              key={quest.id}
              onClick={() => startQuest(quest)}
              className="bg-white rounded-[40px] shadow-xl overflow-hidden hover:scale-105 transition-all border-4 border-transparent hover:border-indigo-200 text-left flex flex-col group"
            >
              <div className={`${quest.color} p-8 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform`}>
                {quest.icon}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black text-gray-800 leading-tight">{quest.title}</h3>
                <p className="text-gray-400 font-bold text-sm mb-3">{quest.idnTitle}</p>
                <p className="text-xs text-gray-500 italic">"{quest.description}"</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const characterEmoji = selectedQuest.id === 'magic_key' ? '🦉' : selectedQuest.id === 'silent_piano' ? '🐱' : '🦄';

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col h-[85vh]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { setSelectedQuest(null); setMessages([]); }} className="text-indigo-600 font-bold flex items-center gap-2 hover:-translate-x-1 transition-transform">
          ⬅️ Change Quest
        </button>
        <div className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-black text-sm uppercase flex items-center gap-2">
          <span>Quest: {selectedQuest.title}</span>
          <span className="animate-pulse">{selectedQuest.icon}</span>
        </div>
      </div>

      <div className="bg-indigo-900 rounded-[50px] flex-1 flex flex-col overflow-hidden border-8 border-indigo-700 shadow-2xl relative">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl animate-pulse">📚</div>
          <div className="absolute bottom-20 right-20 text-6xl animate-bounce">🌫️</div>
          <div className="absolute top-1/2 left-1/4 text-4xl animate-float-slow">✨</div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10 scrollbar-hide">
          <div className="flex justify-center mb-8">
            <div className={`p-6 rounded-full border-4 border-white/20 animate-character-breathe shadow-2xl ${selectedQuest.color}`}>
              <span className="text-8xl animate-character-blink block">{characterEmoji}</span>
            </div>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] p-6 rounded-[35px] text-lg font-bold shadow-lg relative group ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-indigo-900 border-4 border-indigo-100 rounded-tl-none'}`}>
                {msg.text}
                {msg.role === 'model' && (
                  <div className="absolute -left-3 -top-3 text-2xl group-hover:scale-125 transition-transform">🗨️</div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-indigo-300 font-black italic animate-pulse">
               <span className="text-2xl">{characterEmoji}</span>
               Thinking... ✨
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 bg-indigo-800/80 backdrop-blur flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer in English... (Ketik jawabanmu...)"
            className="flex-1 p-5 rounded-[30px] bg-indigo-950 text-white text-xl outline-none border-4 border-indigo-600 focus:border-indigo-400 transition-all placeholder:text-indigo-400/50 shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="bg-yellow-400 text-indigo-950 px-10 py-5 rounded-[30px] font-black text-xl hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg"
          >
            SAY IT! 🗣️
          </button>
        </div>
      </div>
      
      <p className="mt-4 text-center text-gray-400 text-xs font-bold italic">
        "Speak English to move the story forward! Toby's friends are counting on you."
      </p>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default RoleplayIsland;
