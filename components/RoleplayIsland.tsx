
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { startChatSession } from '../services/geminiService';

interface RoleplayIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

const RoleplayIsland: React.FC<RoleplayIslandProps> = ({ onBack, addPoints }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hoot hoot! Welcome, brave explorer. I am Mayor Hoot. A mysterious fog has covered our library! Can you help me find the 'MAGIC KEY'? It is small, shiny, and made of gold. Help me by describing where we should look!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    chatRef.current = startChatSession(
      "You are Mayor Hoot, the owl mayor of Grammarton. The user is helping you solve a mystery. " +
      "The current mystery: The Magic Key is lost in the Library. " +
      "Act very formal but friendly. Use owl puns like 'Hoot-tastic!'. " +
      "Only progress the story if the user answers in simple English. " +
      "If they speak Indonesian, kindly ask them to 'try the magic language' (English). " +
      "Keep responses very short and descriptive of the scene."
    );
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      addPoints(15, "Advancing the story! 🦉✨");
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Hoot! My feathers are ruffled. Let's try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col h-[80vh]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-indigo-600 font-bold flex items-center gap-2">⬅️ Exit Quest</button>
        <div className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-black text-sm uppercase">Quest: The Mystery Key 🗝️</div>
      </div>

      <div className="bg-indigo-900 rounded-[50px] flex-1 flex flex-col overflow-hidden border-8 border-indigo-700 shadow-2xl relative">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl animate-pulse">📚</div>
          <div className="absolute bottom-20 right-20 text-6xl animate-bounce">🌫️</div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10">
          <div className="flex justify-center mb-10">
            <div className="bg-indigo-800 p-6 rounded-full border-4 border-indigo-400 animate-character-breathe shadow-xl">
              <span className="text-8xl animate-character-blink block">🦉</span>
            </div>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-6 rounded-[30px] text-xl font-bold shadow-lg ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-900 border-4 border-indigo-100'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && <div className="text-indigo-400 font-black italic">Mayor Hoot is thinking... 🦉✨</div>}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 bg-indigo-800 flex gap-4">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer to Mayor Hoot..."
            className="flex-1 p-5 rounded-3xl bg-indigo-950 text-white text-xl outline-none border-4 border-indigo-600 focus:border-indigo-400 transition-all"
          />
          <button onClick={handleSend} className="bg-indigo-400 text-indigo-950 px-8 rounded-3xl font-black text-xl hover:bg-indigo-300 active:scale-95 transition-all">HOOT!</button>
        </div>
      </div>
    </div>
  );
};

export default RoleplayIsland;
