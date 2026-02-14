
export enum GameType {
  VOCAB = 'VOCAB',
  CHAT = 'CHAT',
  IMAGE_QUEST = 'IMAGE_QUEST',
  CAMERA_QUEST = 'CAMERA_QUEST',
  MATCHING = 'MATCHING',
  SCRAMBLE = 'SCRAMBLE',
  CINEMA = 'CINEMA',
  SINGING = 'SINGING',
  ROLEPLAY = 'ROLEPLAY',
  MIMIC = 'MIMIC',
  SCAVENGER = 'SCAVENGER',
  PET = 'PET',
  TRACING = 'TRACING',
  SIMON_SAYS = 'SIMON_SAYS',
  I_SPY = 'I_SPY',
  GREETING = 'GREETING'
}

export interface PetState {
  name: string;
  stage: 'egg' | 'baby' | 'junior' | 'master';
  happiness: number;
  lastInteraction: string;
}

export interface Flashcard {
  english: string;
  indonesian: string;
  example: string;
  imageUrl?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Quest {
  title: string;
  description: string;
  targetWord: string;
  hint: string;
}

export interface ScrambleWord {
  word: string;
  hint: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  idnTitle: string;
  goal: number;
  current: number;
  reward: number;
  type: 'vocab' | 'chat' | 'scramble' | 'any' | 'singing' | 'scavenger' | 'tracing';
  isClaimed: boolean;
  date: string;
}

export interface IslandMastery {
  percent: number;
  level: string;
  idnLevel: string;
  color: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  title: string;
  joinedDate: string;
  petName?: string;
  learnedWords: string[];
  eatenWords: string[]; 
  tutorialComplete: boolean;
}

export interface JournalEntry {
  id: string;
  type: 'photo' | 'drawing' | 'movie' | 'tracing' | 'badge';
  english: string;
  indonesian: string;
  data: string; // base64 or URL
  date: string;
}
