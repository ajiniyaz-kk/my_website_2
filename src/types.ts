export interface WordItem {
  id: string;
  karakalpak: string;
  turkish: string;
  phonetic?: string;
  partOfSpeech?: string; // e.g., Noun, Verb, Adjective
  exampleTurkish?: string;
  exampleKarakalpak?: string;
}

export interface VocabularyUnit {
  id: string;
  unitNumber: number;
  titleKarakalpak: string;
  titleTurkish: string;
  description: string;
  iconName?: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  words: WordItem[];
  isCustom?: boolean;
}

export interface QuizResultItem {
  wordId: string;
  karakalpakWord: string;
  correctTurkish: string;
  userAnswer: string;
  isCorrect: boolean;
  isSkipped?: boolean;
  partOfSpeech?: string;
  score: number;
  explanationKarakalpak: string;
  exampleSentenceTurkish?: string;
  exampleSentenceKarakalpak?: string;
}

export interface SpeakingMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  feedback?: {
    grammarKarakalpak: string;
    betterPhrases: string[];
    cefrEstimate: string;
  };
}

export interface WritingEvaluation {
  totalScore: number; // max 30
  CEFRBand: string; // A1, A2, B1, B2, C1, C2
  taskFulfillmentScore: number;
  coherenceScore: number;
  vocabularyScore: number;
  grammarScore: number;
  generalFeedbackKarakalpak: string;
  strengthsKarakalpak: string[];
  weaknessesKarakalpak: string[];
  correctedEssayTurkish: string;
}

export interface ReadingQuestion {
  id: number;
  questionTurkish: string;
  questionKarakalpak: string;
  options: string[];
  correctIndex: number;
  explanationKarakalpak: string;
}

export interface ReadingMaterial {
  titleTurkish: string;
  titleKarakalpak: string;
  passageTurkish: string;
  vocabularyNotes: {
    turkishWord: string;
    karakalpakMeaning: string;
    explanation?: string;
  }[];
  questions: ReadingQuestion[];
}

export interface NewsItem {
  id: string;
  titleKarakalpak: string;
  titleTurkish: string;
  category: "Exam" | "Grammar" | "Culture" | "Vocabulary";
  date: string;
  summaryKarakalpak: string;
  contentTurkish: string;
  contentKarakalpak: string;
  author: string;
  readTimeMinutes: number;
  featuredWord?: {
    turkish: string;
    karakalpak: string;
    example: string;
  };
}

export type ThemeMode = "system" | "dark" | "light";

export interface UserProfile {
  isLoggedIn: boolean;
  id: string;
  name: string;
  emailOrPhone: string;
  authProvider: "email" | "google" | "phone";
  avatarUrl?: string;
  targetLevel: "A2" | "B1" | "B2" | "C1";
  dailyGoalWords: number;
  joinDate: string;
  notificationsEnabled: boolean;
  role?: "admin" | "user";
  status?: "online" | "offline";
  lastActive?: string;
  wordsLearnedCount?: number;
}

export interface RegisteredUser extends UserProfile {
  passwordHash?: string;
  isBlocked?: boolean;
}

export type AppTab =
  | "units"
  | "speaking"
  | "writing"
  | "reading"
  | "listening"
  | "news"
  | "sertifikat"
  | "admin";

