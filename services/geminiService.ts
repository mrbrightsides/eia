import { GoogleGenAI, SchemaType } from "@google/genai";
import { Flashcard, ScrambleWord, DailyQuest } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Inisialisasi AI
const genAI = new GoogleGenAI(API_KEY);

const callAiWithRetry = async (fn: () => Promise<any>, retries = 2): Promise<any> => {
  try {
    if (!API_KEY) throw new Error("API Key hilang! Pastikan .env.local dan Vercel Env sudah diset VITE_GEMINI_API_KEY");
    return await fn();
  } catch (err: any) {
    // Retry logic untuk error internal/server
    if (retries > 0 && (err.message?.includes("internal error") || err.message?.includes("503") || err.message?.includes("overloaded"))) {
      console.warn(`AI sibuk, mencoba lagi... (${retries} sisa)`);
      await new Promise(r => setTimeout(r, 1500));
      return callAiWithRetry(fn, retries - 1);
    }
    throw err;
  }
};

// --- FITUR UTAMA ---

export const identifyObject = async (base64Image: string): Promise<{ english: string, indonesian: string, fact: string } | null> => {
  return callAiWithRetry(async () => {
    // Bersihkan header base64 jika ada
    const cleanBase64 = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            english: { type: SchemaType.STRING },
            indonesian: { type: SchemaType.STRING },
            fact: { type: SchemaType.STRING }
          },
          required: ["english", "indonesian", "fact"]
        }
      }
    });

    const result = await model.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
      { text: "Identify the main object in this image for a child. Return the English name, the Indonesian name, and a very short fun fact in English. Format as JSON." }
    ]);
    
    return JSON.parse(result.response.text());
  });
};

export const playPronunciation = async (text: string) => {
  try {
    if (!API_KEY) return;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Say clearly: ${text}` }] }],
      generationConfig: {
        // @ts-ignore - Support audio output
        responseModalities: ["audio"], 
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });

    const base64Audio = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("Gagal memutar suara:", error);
  }
};

export const evaluateMimicry = async (audioBlob: Blob, targetPhrase: string): Promise<{ score: number, feedback: string, idnFeedback: string }> => {
  return callAiWithRetry(async () => {
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(audioBlob);
    });
    const base64Audio = await base64Promise;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            feedback: { type: SchemaType.STRING },
            idnFeedback: { type: SchemaType.STRING }
          },
          required: ["score", "feedback", "idnFeedback"]
        }
      }
    });

    const result = await model.generateContent([
      { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: base64Audio } },
      { text: `The user is trying to mimic this English phrase: "${targetPhrase}". Evaluate their pronunciation and energy for a child. Return JSON: { "score": 1-100, "feedback": "string", "idnFeedback": "string" }` }
    ]);
    
    return JSON.parse(result.response.text());
  });
};

// --- HELPER FUNCTIONS ---

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}