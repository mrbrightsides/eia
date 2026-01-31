
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { Flashcard, Quest, ScrambleWord, DailyQuest } from "../types";

const createAi = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const callAiWithRetry = async (fn: (ai: GoogleGenAI) => Promise<any>, retries = 2): Promise<any> => {
  try {
    const ai = createAi();
    return await fn(ai);
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
  return callAiWithRetry(async (ai) => {
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
        { text: `The user is trying to mimic this English phrase: "${targetPhrase}". Evaluate their pronunciation and energy for a child. Return JSON: { "score": 1-100, "feedback": "string", "idnFeedback": "string" }` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            idnFeedback: { type: Type.STRING }
          },
          required: ["score", "feedback", "idnFeedback"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const verifyScavengerHunt = async (base64Image: string, target: string): Promise<{ found: boolean, detail: string, englishWord: string }> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
        { text: `Verify if this image contains a: ${target}. If yes, confirm and give a fun fact. Return JSON: { "found": boolean, "detail": "string", "englishWord": "string" }` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            found: { type: Type.BOOLEAN },
            detail: { type: Type.STRING },
            englishWord: { type: Type.STRING }
          },
          required: ["found", "detail", "englishWord"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const getVocabulary = async (category: string): Promise<Flashcard[]> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 English vocabulary flashcards for elementary kids in the category "${category}". 
      Provide the English word, its Indonesian translation, and a simple English example sentence. 
      Also include a valid image URL from loremflickr.com using keywords related to the word (e.g., https://loremflickr.com/400/300/cartoon,dog). 
      Format as JSON array of objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              indonesian: { type: Type.STRING },
              example: { type: Type.STRING },
              imageUrl: { type: Type.STRING }
            },
            required: ["english", "indonesian", "example", "imageUrl"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  });
};

export const generateDailyQuest = async (): Promise<Partial<DailyQuest>> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a simple English learning mission for a child. Types: 'vocab', 'chat', 'scramble', 'scavenger'. Return a JSON with title (English), idnTitle (Indonesian), goal (number between 1-5), type, and reward (usually 200).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            idnTitle: { type: Type.STRING },
            goal: { type: Type.NUMBER },
            reward: { type: Type.NUMBER },
            type: { type: Type.STRING }
          },
          required: ["title", "idnTitle", "goal", "reward", "type"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }).catch(() => ({ title: "Word Explorer", idnTitle: "Penjelajah Kata", goal: 5, reward: 200, type: 'vocab' }));
};

export const getScrambleWords = async (): Promise<ScrambleWord[]> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 simple English words (4-7 letters) for elementary kids to unscramble. 
      Provide the English word and its Indonesian translation as a hint. 
      Format as JSON array of objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              hint: { type: Type.STRING }
            },
            required: ["word", "hint"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  });
};

export const generateQuestImage = async (prompt: string): Promise<string | null> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A vibrant, cute, cartoon-style illustration for kids of: ${prompt}. Bright colors, high quality.` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imagePart ? `data:image/png;base64,${imagePart.inlineData.data}` : null;
  });
};

export const identifyObject = async (base64Image: string): Promise<{ english: string, indonesian: string, fact: string } | null> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
          { text: "Identify the main object in this image for a child. Return the English name, the Indonesian name, and a very short fun fact in English. Format as JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            english: { type: Type.STRING },
            indonesian: { type: Type.STRING },
            fact: { type: Type.STRING }
          },
          required: ["english", "indonesian", "fact"]
        }
      }
    });
    return JSON.parse(response.text || "null");
  });
};

export const startChatSession = (systemInstruction: string) => {
  const ai = createAi();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction + " Always be encouraging and use a mix of English and Indonesian. Keep sentences short for kids."
    }
  });
};

export const translateToIndonesian = async (text: string): Promise<string> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate this text to simple, child-friendly Indonesian. The translation should be warm and helpful. Only return the translated text: "${text}"`,
    });
    return response.text?.trim() || "Maaf, aku tidak bisa menerjemahkan itu.";
  }).catch(() => "Maaf, sirkuit penerjemah Toby sedang macet.");
};

export const createVeoInstance = () => createAi();

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
