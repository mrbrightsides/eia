
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { JournalEntry } from '../types';
import { playPronunciation } from '../services/geminiService';

interface TracingIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  unlockBadge?: () => void;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LETTER_PATHS: Record<string, string> = {
  'A': 'M 100 350 L 250 50 L 400 350 M 175 250 L 325 250',
  'B': 'M 100 50 L 100 350 M 100 50 C 350 50 350 200 100 200 C 350 200 350 350 100 350',
  'C': 'M 350 100 C 300 50 100 50 100 200 C 100 350 300 350 350 300',
  'D': 'M 100 50 L 100 350 C 400 350 400 50 100 50',
  'E': 'M 350 50 L 100 50 L 100 350 L 350 350 M 100 200 L 300 200',
  'F': 'M 350 50 L 100 50 L 100 350 M 100 200 L 300 200',
  'G': 'M 350 100 C 300 50 100 50 100 200 C 100 350 300 350 350 300 L 350 200 L 250 200',
  'H': 'M 100 50 L 100 350 M 400 50 L 400 350 M 100 200 L 400 200',
  'I': 'M 150 50 L 350 50 M 250 50 L 250 350 M 150 350 L 350 350',
  'J': 'M 150 50 L 350 50 M 250 50 L 250 300 C 250 350 150 350 100 300',
  'K': 'M 100 50 L 100 350 M 100 200 L 350 50 M 100 200 L 350 350',
  'L': 'M 100 50 L 100 350 L 350 350',
  'M': 'M 100 350 L 100 50 L 250 200 L 400 50 L 400 350',
  'N': 'M 100 350 L 100 50 L 400 350 L 400 50',
  'O': 'M 250 50 C 400 50 400 350 250 350 C 100 350 100 50 250 50',
  'P': 'M 100 350 L 100 50 C 350 50 350 200 100 200',
  'Q': 'M 250 50 C 400 50 400 350 250 350 C 100 350 100 50 250 50 M 300 300 L 400 400',
  'R': 'M 100 350 L 100 50 C 350 50 350 200 100 200 L 350 350',
  'S': 'M 350 100 C 300 50 100 50 100 150 C 100 250 350 200 350 300 C 350 400 150 400 100 350',
  'T': 'M 100 50 L 400 50 M 250 50 L 250 350',
  'U': 'M 100 50 L 100 300 C 100 350 400 350 400 300 L 400 50',
  'V': 'M 100 50 L 250 350 L 400 50',
  'W': 'M 50 50 L 125 350 L 250 150 L 375 350 L 450 50',
  'X': 'M 100 50 L 400 350 M 400 50 L 100 350',
  'Y': 'M 100 50 L 250 200 L 400 50 M 250 200 L 250 350',
  'Z': 'M 100 50 L 400 50 L 100 350 L 400 350'
};

const HIT_THRESHOLD = 30; // pixels

interface SampledPoint {
  x: number;
  y: number;
  isHit: boolean;
}

const TracingIsland: React.FC<TracingIslandProps> = ({ onBack, addPoints, onSave, unlockBadge }) => {
  const [currentLetter, setCurrentLetter] = useState('A');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [tracedLettersCount, setTracedLettersCount] = useState(0);
  const [sampledPoints, setSampledPoints] = useState<SampledPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{x: number, y: number} | null>(null);

  const progress = useMemo(() => {
    if (sampledPoints.length === 0) return 0;
    const hitCount = sampledPoints.filter(p => p.isHit).length;
    return (hitCount / sampledPoints.length) * 100;
  }, [sampledPoints]);

  // Initial sampling of the path
  useEffect(() => {
    if (pathRef.current) {
      const path = pathRef.current;
      const length = path.getTotalLength();
      const points: SampledPoint[] = [];
      const step = 15; // sample every 15 units
      
      for (let i = 0; i <= length; i += step) {
        const p = path.getPointAtLength(i);
        points.push({ x: p.x, y: p.y, isHit: false });
      }
      setSampledPoints(points);
    }
  }, [currentLetter]);

  useEffect(() => {
    if (progress >= 95 && !isCompleted && sampledPoints.length > 0) {
      handleComplete();
    }
  }, [progress, isCompleted, sampledPoints]);

  const handleComplete = () => {
    setIsCompleted(true);
    playPronunciation(currentLetter);
    addPoints(20, `Excellent Tracing of ${currentLetter}! ✍️✨`);
    setTracedLettersCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5 && unlockBadge) unlockBadge();
      return newCount;
    });
  };

  const handleSaveToScrapbook = () => {
    if (!onSave || !canvasRef.current || isSaved) return;

    // Create a composite image of the trace on white background for the scrapbook
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 500;
    tempCanvas.height = 500;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, 500, 500);
      
      // Draw the grey guide path
      tempCtx.strokeStyle = '#f1f5f9';
      tempCtx.lineWidth = 40;
      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';
      const path = new Path2D(LETTER_PATHS[currentLetter]);
      tempCtx.stroke(path);

      // Draw user's trace
      tempCtx.drawImage(canvasRef.current, 0, 0);

      onSave({
          type: 'tracing',
          english: `Letter ${currentLetter}`,
          indonesian: `Huruf ${currentLetter}`,
          data: tempCanvas.toDataURL('image/png')
      });
      setIsSaved(true);
      addPoints(10, "Added to Scrapbook! 📓");
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `tracing-${currentLetter}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    addPoints(5, "Downloaded your letter! 💾");
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCompleted) return;
    setIsDrawing(true);
    const pos = getPos(e);
    lastPointRef.current = pos;
    draw(pos);
  };

  const checkProximity = (x: number, y: number) => {
    setSampledPoints(prev => {
      let changed = false;
      const next = prev.map(p => {
        if (p.isHit) return p;
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < HIT_THRESHOLD) {
          changed = true;
          return { ...p, isHit: true };
        }
        return p;
      });
      return changed ? next : prev;
    });
  };

  const draw = (pos: {x: number, y: number}) => {
    if (!isDrawing || !canvasRef.current || isCompleted || !lastPointRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#22d3ee'; // cyan-400
    ctx.lineWidth = 25;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPointRef.current = pos;
    checkProximity(pos.x, pos.y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x: 0, y: 0};
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const reset = () => {
    setIsCompleted(false);
    setIsSaved(false);
    setSampledPoints(prev => prev.map(p => ({ ...p, isHit: false })));
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const nextLetter = () => {
    const idx = LETTERS.indexOf(currentLetter);
    const next = LETTERS[(idx + 1) % LETTERS.length];
    setCurrentLetter(next);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center min-h-[70vh]">
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-cyan-600 font-bold flex items-center gap-2 transition-transform hover:-translate-x-1">
          ⬅️ Back to Map
        </button>
        <div className="bg-cyan-100 text-cyan-700 px-4 py-1 rounded-full font-black text-sm uppercase tracking-wider">
          Tracing Trails ✍️
        </div>
      </div>

      <div className="bg-white rounded-[50px] shadow-2xl p-8 w-full max-w-2xl border-8 border-cyan-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-10 right-10 text-4xl animate-pulse opacity-20">🖍️</div>
        <div className="absolute bottom-10 left-10 text-4xl animate-bounce opacity-20">🎨</div>

        <h2 className="text-3xl font-black text-cyan-600 mb-2 uppercase tracking-tight">Trace the Letter!</h2>
        <p className="text-gray-500 font-bold mb-6 italic">Follow the magic dots for Huruf <span className="text-cyan-600 text-2xl ml-1">{currentLetter}</span></p>

        {/* Tracing Area */}
        <div className="relative bg-gray-50 rounded-3xl w-full aspect-square border-4 border-dashed border-cyan-200 overflow-hidden touch-none shadow-inner">
          {/* Template SVG for Sampling Reference (Invisible) */}
          <svg className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" viewBox="0 0 500 500">
             <path 
                ref={pathRef}
                d={LETTER_PATHS[currentLetter]} 
             />
          </svg>

          {/* Interactive Guide Dots Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
            {sampledPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={p.isHit ? 8 : 4}
                className={`transition-all duration-300 ${p.isHit ? 'fill-green-400' : 'fill-gray-300'}`}
              />
            ))}
          </svg>

          {/* User Drawing Canvas */}
          <canvas 
            ref={canvasRef}
            width={500}
            height={500}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={(e) => draw(getPos(e))}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={(e) => {
              e.preventDefault();
              draw(getPos(e));
            }}
            onTouchEnd={stopDrawing}
          />

          {isCompleted && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in zoom-in duration-500 z-20 p-6 text-center">
               <div className="text-9xl mb-4 animate-bounce drop-shadow-xl">🌟</div>
               <div className="text-5xl font-black text-cyan-600 drop-shadow-lg tracking-widest mb-4">AWESOME!</div>
               
               <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm">
                 <button 
                   onClick={handleSaveToScrapbook}
                   disabled={isSaved}
                   className={`flex-1 min-w-[160px] py-4 rounded-3xl font-black text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isSaved ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                 >
                   {isSaved ? "SAVED! ✅" : "📓 SAVE BOOK"}
                 </button>
                 <button 
                   onClick={handleDownload}
                   className="flex-1 min-w-[160px] bg-cyan-600 text-white py-4 rounded-3xl font-black text-lg shadow-lg hover:bg-cyan-700 active:scale-95 flex items-center justify-center gap-2"
                 >
                   <span>💾</span> DOWNLOAD
                 </button>
               </div>
               
               <button 
                 onClick={nextLetter}
                 className="mt-6 text-cyan-600 font-black hover:scale-105 transition-transform underline underline-offset-4"
               >
                 TRY NEXT LETTER ➡️
               </button>
            </div>
          )}
        </div>

        {/* Progress Bar with Percentage */}
        <div className="w-full mt-8">
          <div className="flex justify-between text-[10px] font-black text-cyan-400 uppercase mb-1 px-1">
            <span>Tracing Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden border-2 border-cyan-50">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex gap-4 w-full">
            <button 
                onClick={reset}
                className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-3xl font-black shadow-md hover:bg-gray-100 transition-all active:scale-95 border border-gray-200"
            >
                RESET 🔄
            </button>
            <button 
                onClick={nextLetter}
                className="flex-2 bg-cyan-600 text-white py-4 rounded-3xl font-black shadow-lg hover:bg-cyan-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {isCompleted ? "NEXT LETTER" : "SKIP LETTER"} ➡️
            </button>
        </div>

        {/* Letter Selector Grid */}
        <div className="mt-10 w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-2 px-2">
                {LETTERS.map(l => (
                    <button 
                        key={l}
                        onClick={() => { setCurrentLetter(l); reset(); }}
                        className={`min-w-[44px] h-11 rounded-xl font-black transition-all ${currentLetter === l ? 'bg-cyan-600 text-white scale-110 shadow-lg ring-4 ring-cyan-100' : 'bg-white text-gray-400 border border-gray-100 hover:bg-cyan-50'}`}
                    >
                        {l}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default TracingIsland;
