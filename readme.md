# 🏝️ English Island Adventure

An immersive, fun, and bilingual (English-Indonesian) web application designed to teach English to elementary school students. Powered by Google's Gemini AI, this app turns language learning into an epic exploration.

## 🌟 Key Features

### 🎮 Learning Games
- **🪄 Vocab Island**: Magic flashcards with real-time pronunciation and AI-generated examples.
- **🧩 Matching Mayhem**: A memory-style game connecting English words to their Indonesian meanings.
- **🌪️ Word Scramble**: Unscramble letters to fix "broken" words with hints from Toby.
- **🎤 Singing Stage**: Sing along to classics like *Twinkle Twinkle* with real-time lyric highlighting and AI vocal feedback.

### 🤖 AI-Powered Exploration
- **🐻 Chat Buddy**: Conversational practice with Toby the Bear. Toby provides gentle grammar corrections and bilingual tips.
- **🎨 Image Quest**: A magical canvas where students' English descriptions come to life as AI-generated art.
- **🔍 Magic Lens**: Use your device's camera to identify real-world objects in English with fun facts.
- **🎬 Island Cinema**: Transform short English stories into high-quality AI videos using the Veo model.

### 🏆 Gamification
- **Leveling System**: Earn points to rank up from a *Little Scout* to an *Island Master*.
- **Daily Missions**: Complete unique daily challenges to earn bonus rewards.
- **Trophy Room**: Unlock badges for consistency, vocabulary mastery, and creative achievements.
- **Adventure Scrapbook**: Save your photos and drawings to a personal digital journal.

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **AI Engine**: Google Gemini API (`@google/genai`).
- **Models Used**:
  - `gemini-3-flash-preview`: For core logic, chat, and games.
  - `gemini-2.5-flash-image`: For generative art and object identification.
  - `gemini-2.5-flash-preview-tts`: For clear, native-sounding speech.
  - `veo-3.1-fast-generate-preview`: For high-quality video generation.

## 🚀 Getting Started

1. **Environment Variables**: The app requires a valid Google Gemini API key provided via `process.env.API_KEY`.
2. **Permissions**: Ensure microphone and camera permissions are granted for the **Singing Stage** and **Magic Lens** features.
3. **Cinema Credits**: Generating videos requires selecting a billing-enabled project via the in-app key selector.

## 📜 Credits
Adventure crafted with ❤️ by Toby's Friends.

- **Developer**: [github.com/mrbrightsides](https://github.com/mrbrightsides)
- **Web**: [rantai.elpeef.com](https://rantai.elpeef.com)

---
*Note: This application is designed for educational purposes. Language learning is most effective when supervised by a parent or teacher.*