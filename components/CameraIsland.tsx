import React, { useState, useRef, useEffect } from 'react';
import { identifyObject, playPronunciation } from '../services/geminiService';
import { JournalEntry } from '../types';

interface CameraIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}

const CameraIsland: React.FC<CameraIslandProps> = ({ onBack, addPoints, onSave }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ english: string, indonesian: string, fact: string } | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Please allow camera access to use Magic Lens!");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw image to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Convert to Base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      
      setLoading(true);
      setResult(null);
      
      try {
        const data = await identifyObject(imageData);
        if (data) {
          setResult(data);
          playPronunciation(data.english);
          addPoints(40, `Found a ${data.english}! 🔍`);
        }
      } catch (error) {
        console.error("Identification failed", error);
        alert("Oops! Toby couldn't see that clearly. Try again!");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveToJournal = () => {
    if (!result || !capturedImage || !onSave) return;
    onSave({
      type: 'photo',
      english: result.english,
      indonesian: result.indonesian,
      data: capturedImage
    });
    addPoints(10, "Captured in Scrapbook! 📓");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-blue-600 font-bold flex items-center gap-2">
          ⬅️ Back to Map
        </button>
        <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold">
          Magic Lens 🔍
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
        {!capturedImage ? (
           <video 
             ref={videoRef} 
             autoPlay 
             playsInline 
             className="w-full h-full object-cover"
           />
        ) : (
           <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-xl">Analyzing... ✨</p>
          </div>
        )}

        {/* Results Overlay */}
        {result && !loading && (
          <div className="absolute inset-x-4 bottom-4 animate-in slide-in-from-bottom-10 duration-500 z-30">
            <div className="bg-white/95 backdrop-blur p-6 rounded-[30px] shadow-2xl border-4 border-green-400">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-3xl p-3 rounded-2xl">🐻</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-3xl font-black text-green-600 uppercase tracking-tight">{result.english}</h3>
                    <button 
                      onClick={() => playPronunciation(result.english)}
                      className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm hover:scale-110 transition-transform"
                    >
                      🔊
                    </button>
                  </div>
                  <p className="text-gray-500 font-bold mb-2">Artinya: <span className="text-blue-600">{result.indonesian}</span></p>
                  <p className="text-gray-700 text-sm italic bg-gray-50 p-2 rounded-xl">
                    "Did you know? {result.fact}"
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={handleSaveToJournal}
                      className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-purple-700"
                    >
                      📓 Collect
                    </button>
                    <button 
                      onClick={() => {
                        setResult(null);
                        setCapturedImage(null);
                      }}
                      className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-200"
                    >
                      Try Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {!result && !loading && !capturedImage && (
        <button 
          onClick={handleCapture}
          className="mt-8 bg-green-500 hover:bg-green-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-all active:scale-90 group"
        >
          <div className="w-14 h-14 border-4 border-white/40 rounded-full flex items-center justify-center group-hover:border-white">
            <div className="w-10 h-10 bg-white rounded-full" />
          </div>
        </button>
      )}
      
      <div className="mt-8 text-center text-gray-500 max-w-sm">
        Point your camera at an object and press the button. Toby will tell you what it is!
      </div>
    </div>
  );
};

export default CameraIsland;