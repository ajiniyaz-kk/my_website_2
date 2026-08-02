import React, { useState, useEffect } from "react";
import { AppTab, UserProfile, ThemeMode } from "./types";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { VocabularyTrainer } from "./components/VocabularyTrainer";
import { SpeakingTutor } from "./components/SpeakingTutor";
import { WritingEvaluator } from "./components/WritingEvaluator";
import { ReadingPractice } from "./components/ReadingPractice";
import { ListeningPractice } from "./components/ListeningPractice";
import { NewsSection } from "./components/NewsSection";
import { SertifikatInfo } from "./components/SertifikatInfo";
import { AuthAndProfileModal } from "./components/AuthAndProfileModal";
import { AdminPanel } from "./components/AdminPanel";
import { Lock, LogIn, UserPlus, Sparkles, MessageSquare, FileCheck, Award, Users } from "lucide-react";

export interface UserStats {
  totalWordsLearned: number;
  quizAccuracy: number;
  completedUnitsCount: number;
  totalCorrectAnswers: number;
  totalQuestionsAnswered: number;
  learnedWordIds: string[];
  completedUnitIds: string[];
  currentStreakDays?: number;
  lastActivityDate?: string;
}

const STATS_STORAGE_KEY = "tr_app_user_stats_v2";
const PROFILE_STORAGE_KEY = "tr_app_user_profile_v1";
const THEME_STORAGE_KEY = "tr_app_theme_mode_v1";

const loadInitialStats = (): UserStats => {
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      const learnedIds = Array.isArray(p.learnedWordIds) ? p.learnedWordIds : [];
      const completedUnits = Array.isArray(p.completedUnitIds) ? p.completedUnitIds : [];
      const totalQuestions = typeof p.totalQuestionsAnswered === "number" ? p.totalQuestionsAnswered : 0;
      const totalCorrect = typeof p.totalCorrectAnswers === "number" ? p.totalCorrectAnswers : 0;
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : (p.quizAccuracy || 0);

      return {
        totalWordsLearned: learnedIds.length || p.totalWordsLearned || 0,
        quizAccuracy: accuracy,
        completedUnitsCount: completedUnits.length || p.completedUnitsCount || 0,
        totalCorrectAnswers: totalCorrect,
        totalQuestionsAnswered: totalQuestions,
        learnedWordIds: learnedIds,
        completedUnitIds: completedUnits,
        currentStreakDays: p.currentStreakDays || 3,
        lastActivityDate: p.lastActivityDate || new Date().toISOString().split("T")[0],
      };
    }
  } catch (e) {
    console.error("Error loading stats from localStorage:", e);
  }

  return {
    totalWordsLearned: 28,
    quizAccuracy: 92,
    completedUnitsCount: 2,
    totalCorrectAnswers: 28,
    totalQuestionsAnswered: 30,
    learnedWordIds: Array.from({ length: 28 }, (_, i) => `init_word_${i}`),
    completedUnitIds: ["unit_1", "unit_2"],
    currentStreakDays: 3,
    lastActivityDate: new Date().toISOString().split("T")[0],
  };
};

const loadInitialProfile = (): UserProfile => {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading profile from localStorage:", e);
  }

  return {
    isLoggedIn: false,
    id: "usr_guest",
    name: "Mıyman (Agza Emes)",
    emailOrPhone: "",
    authProvider: "email",
    role: "user",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
    targetLevel: "B2",
    dailyGoalWords: 30,
    joinDate: new Date().toISOString().split("T")[0],
    notificationsEnabled: true,
  };
};

const loadInitialTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (saved && (saved === "system" || saved === "dark" || saved === "light")) {
      return saved;
    }
  } catch (e) {
    console.error("Error loading theme from localStorage:", e);
  }
  return "system";
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");

  // User Stats State
  const [userStats, setUserStats] = useState<UserStats>(loadInitialStats);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(loadInitialProfile);

  // Theme Mode State (system / dark / light)
  const [themeMode, setThemeMode] = useState<ThemeMode>(loadInitialTheme);

  // Auth & Settings Modal Control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<
    "profile" | "login" | "register" | "settings"
  >("profile");

  // Save Stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(userStats));
    } catch (e) {
      console.error("Error saving stats to localStorage:", e);
    }
  }, [userStats]);

  // Save Profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    } catch (e) {
      console.error("Error saving profile to localStorage:", e);
    }
  }, [userProfile]);

  // Save & Apply Device / Custom Theme
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (e) {
      console.error("Error saving theme to localStorage:", e);
    }

    const applyTheme = () => {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const effectiveDark =
        themeMode === "dark" || (themeMode === "system" && isSystemDark);

      if (effectiveDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (themeMode === "system") applyTheme();
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [themeMode]);

  const handleOpenAuthModal = (
    tab: "profile" | "login" | "register" | "settings" = "profile"
  ) => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleQuizCompleted = (
    scorePercent: number,
    wordsTestedCount: number,
    correctCount: number = 0,
    unitId?: string,
    correctWordIds: string[] = []
  ) => {
    setUserStats((prev) => {
      const learnedSet = new Set([...prev.learnedWordIds, ...correctWordIds]);
      const updatedLearnedWordIds = Array.from(learnedSet);

      const completedUnitsSet = new Set(prev.completedUnitIds);
      if (unitId && scorePercent >= 50) {
        completedUnitsSet.add(unitId);
      }
      const updatedCompletedUnitIds = Array.from(completedUnitsSet);

      const newTotalQuestions = prev.totalQuestionsAnswered + wordsTestedCount;
      const newTotalCorrect = prev.totalCorrectAnswers + correctCount;
      const newAccuracy =
        newTotalQuestions > 0
          ? Math.round((newTotalCorrect / newTotalQuestions) * 100)
          : scorePercent;

      return {
        totalWordsLearned: updatedLearnedWordIds.length,
        quizAccuracy: newAccuracy,
        completedUnitsCount: updatedCompletedUnitIds.length,
        totalCorrectAnswers: newTotalCorrect,
        totalQuestionsAnswered: newTotalQuestions,
        learnedWordIds: updatedLearnedWordIds,
        completedUnitIds: updatedCompletedUnitIds,
        currentStreakDays: (prev.currentStreakDays || 1) + 1,
        lastActivityDate: new Date().toISOString().split("T")[0],
      };
    });
  };

  const handleResetStats = () => {
    const emptyStats: UserStats = {
      totalWordsLearned: 0,
      quizAccuracy: 0,
      completedUnitsCount: 0,
      totalCorrectAnswers: 0,
      totalQuestionsAnswered: 0,
      learnedWordIds: [],
      completedUnitIds: [],
      currentStreakDays: 1,
      lastActivityDate: new Date().toISOString().split("T")[0],
    };
    setUserStats(emptyStats);
    localStorage.removeItem(STATS_STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white transition-colors">
      {/* Top Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userStats={userStats}
        onResetStats={handleResetStats}
        userProfile={userProfile}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!userProfile.isLoggedIn ? (
          /* GATED SITE BARRIER (EXPANDED WITH FEATURES & SOCIAL PROOF) */
          <div className="max-w-3xl mx-auto my-6 p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Qaraqalpaq - Túrk Tili AI Platforması</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Platformadan Paydalanıw Ushın Akkaunttan Kiriń!
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                TÖMER hám DTM xalqara sertifikat sınavlarına tayarlanıw, AI sawbetshı hám avtomat baha beriw kónlikpelerinen paydalanıw ushın akkauntyńızǵa kiriń yaki dizimnen ótiń.
              </p>
            </div>

            {/* 3 PLATFORM FEATURE HIGHLIGHT CARDS (VAZIFA 3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-left">
              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs">AI penen Söylesiw</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Real vaqtta AI tutori penen turksha dawıslı ham chat arqalı sóylesiw shınıǵıwları.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs">Avtomat Baha Beriw</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Jazǵan essay ham insholayńızǵa DTM/TÖMER kriteriyaları boyınsha birmomentte baha beriw.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs">Sertifikatqa Tayarlanıw</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  B1, B2, C1 dáreje sertifikat sınavları xam interaktiv test bazaları.
                </p>
              </div>
            </div>

            {/* SOCIAL PROOF STAT ELEMENT (VAZIFA 3) */}
            {/* Note: In production this count will be fetched from backend users API */}
            <div className="py-2 px-4 bg-slate-950/60 border border-slate-800/60 rounded-xl inline-flex items-center space-x-2 text-xs text-slate-300">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-white font-bold">1,250+ paydalanıwshı</strong> TÖMER hám DTM sınavlarına biz penen tayarlanbaqta
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md mx-auto">
              <button
                onClick={() => handleOpenAuthModal("login")}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Akkauntqa Kiriw</span>
              </button>

              <button
                onClick={() => handleOpenAuthModal("register")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs py-3.5 px-4 rounded-xl transition cursor-pointer border border-slate-700 flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Jańa Agza Bolıw (OTP)</span>
              </button>
            </div>
          </div>
        ) : (
          /* FULL LOGGED-IN SITE ACCESS */
          <>
            {activeTab === "dashboard" && (
              <Dashboard
                userProfile={userProfile}
                userStats={{
                  ...userStats,
                  totalWordsLearned: userStats.totalWordsLearned,
                  quizzesCompleted: userStats.completedUnitsCount,
                  averageAccuracy: userStats.quizAccuracy,
                  totalPoints: userStats.totalWordsLearned * 10,
                  currentStreakDays: userStats.currentStreakDays || 3,
                  lastActivityDate: userStats.lastActivityDate || new Date().toISOString().split("T")[0],
                }}
                onSelectTab={setActiveTab}
              />
            )}
            {activeTab === "units" && (
              <VocabularyTrainer onQuizCompleted={handleQuizCompleted} />
            )}
            {activeTab === "speaking" && <SpeakingTutor />}
            {activeTab === "writing" && <WritingEvaluator />}
            {activeTab === "reading" && <ReadingPractice />}
            {activeTab === "listening" && <ListeningPractice />}
            {activeTab === "news" && <NewsSection />}
            {activeTab === "sertifikat" && <SertifikatInfo />}
            {activeTab === "admin" && userProfile.role === "admin" && (
              <AdminPanel userProfile={userProfile} />
            )}
          </>
        )}
      </main>

      {/* User Profile, Auth & Settings Modal */}
      <AuthAndProfileModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        initialTab={authModalInitialTab}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-medium text-slate-300">
            Qaraqalpaq - Túrk Tili Shet Tillerin Biliw Sertifikatı AI Platforması
          </p>
          <p className="text-slate-500">
            Ózbekstan Respublikası Bilim hám kásipıylik kónlikpelerin bahalaw agentligi (DTM) hám TÖMER standartlarına maslandı. Powered by Gemini 3.6 Flash.
          </p>
        </div>
      </footer>
    </div>
  );
}
