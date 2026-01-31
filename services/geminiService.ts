import { GoogleGenAI, Type, SchemaType, Modality } from "@google/genai";
import { Flashcard, Quest, ScrambleWord, DailyQuest } from "../types";

// 1. FIX: Vite pake import.meta.env, bukan process.env
// Pastikan di Vercel namanya VITE_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenAI(API_KEY);

const callAiWithRetry = async (fn: () => Promise<any>, retries = 2): Promise<any> => {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err.message?.includes("internal error") || err.message?.includes("mC") || err.message?.includes("Canceled"))) {
      console.warn(`AI error, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, 1000));
      return callAiWithRetry(fn, retries - 1);
    }
    throw err;
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
        model: 'gemini-1.5-flash', // Pakai model stable jika preview bermasalah
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

export const identifyObject = async (base64Image: string): Promise<{ english: string, indonesian: string, fact: string } | null> => {
  return callAiWithRetry(async () => {
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
      { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
      { text: "Identify the main object in this image for a child. Return the English name, the Indonesian name, and a very short fun fact in English. Format as JSON." }
    ]);
    
    return JSON.parse(result.response.text());
  });
};

export const playPronunciation = async (text: string) => {
  try {
    // 2. FIX: Pastikan API KEY ada sebelum panggil
    if (!API_KEY) throw new Error("API Key is missing!");

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash" // TTS biasanya butuh model yang mendukung multimodal output
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Say clearly: ${text}` }] }],
      generationConfig: {
        // @ts-ignore - SDK types might be outdated for some modalities
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
    console.error("Speech generation failed", error);
  }
};

// Helper decoders (Tetap sama seperti punyamu)
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

export const playPronunciation = async (text: string) => {
  try {
    const ttsAi = createAi();
    const response = await ttsAi.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        // Corrected property name from responseModalalities to responseModalities
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("Speech generation failed", error);
  }
};
