import React, { useState, useEffect } from "react";
import { AppTab, UserProfile, ThemeMode } from "./types";
import { Navbar } from "./components/Navbar";
import { VocabularyTrainer } from "./components/VocabularyTrainer";
import { SpeakingTutor } from "./components/SpeakingTutor";
import { WritingEvaluator } from "./components/WritingEvaluator";
import { ReadingPractice } from "./components/ReadingPractice";
import { ListeningPractice } from "./components/ListeningPractice";
import { NewsSection } from "./components/NewsSection";
import { SertifikatInfo } from "./components/SertifikatInfo";
import { AuthAndProfileModal } from "./components/AuthAndProfileModal";
import { AdminPanel } from "./components/AdminPanel";
import { Lock, LogIn, UserPlus, ShieldCheck, Sparkles, KeyRound } from "lucide-react";

export interface UserStats {
  totalWordsLearned: number;
  quizAccuracy: number;
  completedUnitsCount: number;
  totalCorrectAnswers: number;
  totalQuestionsAnswered: number;
  learnedWordIds: string[];
  completedUnitIds: string[];
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
  const [activeTab, setActiveTab] = useState<AppTab>("units");

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
          /* GATED SITE BARRIER (REQUIREMENT 7) */
          <div className="max-w-2xl mx-auto my-8 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Platformadan Paydalanıw Ushın Akkaunttan Kiriń!
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                Qaraqalpaq - Túrk Tili TÖMER & DTM AI platformasında sabaqlardı ótiw, AI sawbetshı hám sertifikat testlerin tapsırıw ushın jeke akkauntyńızǵa kirińız yaki dizimnen ótiń.
              </p>
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

            {/* QUICK ADMIN ACCESS BADGE */}
            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={() => {
                  const adminUser: UserProfile = {
                    ...userProfile,
                    isLoggedIn: true,
                    id: "usr_admin_1",
                    name: "Admin Xojabaev",
                    emailOrPhone: "admin@tomer.uz",
                    authProvider: "email",
                    role: "admin",
                    status: "online",
                    targetLevel: "C1",
                    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=admin_xojabaev",
                  };
                  setUserProfile(adminUser);
                  setActiveTab("admin");
                }}
                className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center justify-center space-x-1.5 mx-auto bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 py-2 px-4 rounded-xl transition cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>👑 Super Admin Sıpatında Birmomentte Kiriw</span>
              </button>
            </div>
          </div>
        ) : (
          /* FULL LOGGED-IN SITE ACCESS */
          <>
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
