import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Flashcard, ScrambleWord, DailyQuest } from "../types";

/* ===============================
   ENV CONFIG
================================= */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not defined in environment variables");
}

const createAi = () => new GoogleGenAI({ apiKey: API_KEY });

/* ===============================
   RETRY WRAPPER
================================= */

const callAiWithRetry = async (
  fn: (ai: GoogleGenAI) => Promise<any>,
  retries = 2
): Promise<any> => {
  try {
    const ai = createAi();
    return await fn(ai);
  } catch (err: any) {
    if (
      retries > 0 &&
      (err.message?.includes("internal error") ||
        err.message?.includes("Canceled") ||
        err.message?.includes("mC"))
    ) {
      console.warn(`AI error, retrying... (${retries} left)`);
      await new Promise((r) => setTimeout(r, 1000));
      return callAiWithRetry(fn, retries - 1);
    }
    throw err;
  }
};

/* ===============================
   AUDIO EVALUATION
================================= */

export const evaluateMimicry = async (
  audioBlob: Blob,
  targetPhrase: string
) => {
  return callAiWithRetry(async (ai) => {
    const base64Audio = await blobToBase64(audioBlob);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: audioBlob.type || "audio/webm",
            data: base64Audio,
          },
        },
        {
          text: `The user is mimicking: "${targetPhrase}". Evaluate pronunciation for kids.
          Return JSON { score, feedback, idnFeedback }`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            idnFeedback: { type: Type.STRING },
          },
          required: ["score", "feedback", "idnFeedback"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  });
};

/* ===============================
   OBJECT IDENTIFICATION
================================= */

export const identifyObject = async (base64Image: string) => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1],
            },
          },
          {
            text:
              "Identify object for kids. Return JSON { english, indonesian, fact }",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            english: { type: Type.STRING },
            indonesian: { type: Type.STRING },
            fact: { type: Type.STRING },
          },
          required: ["english", "indonesian", "fact"],
        },
      },
    });

    return JSON.parse(response.text || "null");
  });
};

/* ===============================
   VOCABULARY GENERATOR
================================= */

export const getVocabulary = async (category: string): Promise<Flashcard[]> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 English flashcards for kids category "${category}".`,
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
              imageUrl: { type: Type.STRING },
            },
            required: ["english", "indonesian", "example", "imageUrl"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  });
};

/* ===============================
   DAILY QUEST
================================= */

export const generateDailyQuest = async (): Promise<Partial<DailyQuest>> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents:
        "Generate simple English mission for child. Return JSON {title,idnTitle,goal,reward,type}",
      config: { responseMimeType: "application/json" },
    });

    return JSON.parse(response.text || "{}");
  });
};

/* ===============================
   SCRAMBLE WORD
================================= */

export const getScrambleWords = async (): Promise<ScrambleWord[]> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents:
        "Generate 5 simple scramble words for kids. JSON { word, hint }",
      config: { responseMimeType: "application/json" },
    });

    return JSON.parse(response.text || "[]");
  });
};

/* ===============================
   CHAT SESSION
================================= */

export const startChatSession = (systemInstruction: string) => {
  const ai = createAi();

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction:
        systemInstruction +
        " Always be encouraging. Mix English & Indonesian. Keep sentences short.",
    },
  });
};

/* ===============================
   TEXT TO SPEECH
================================= */

export const playPronunciation = async (text: string) => {
  try {
    const ai = createAi();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      const ctx = new AudioContext({ sampleRate: 24000 });
      const audioBuffer = await decodeAudio(
        decodeBase64(base64Audio),
        ctx,
        24000,
        1
      );

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    }
  } catch (err) {
    console.error("TTS failed", err);
  }
};

export const translateToIndonesian = async (text: string): Promise<string> => {
  return callAiWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate this text into simple, friendly Indonesian for children. Only return translated text: "${text}"`,
    });

    return response.text?.trim() || "Maaf, Toby tidak bisa menerjemahkan itu.";
  }).catch(() => "Maaf, sirkuit penerjemah Toby sedang macet.");
};


/* ===============================
   HELPERS
================================= */

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

function decodeBase64(base64: string) {
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function decodeAudio(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  channels: number
) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / channels;

  const buffer = ctx.createBuffer(channels, frameCount, sampleRate);

  for (let ch = 0; ch < channels; ch++) {
    const channelData = buffer.getChannelData(ch);

    for (let i = 0; i < frameCount; i++) {
      channelData[i] =
        dataInt16[i * channels + ch] / 32768.0;
    }
  }

  return buffer;
}
