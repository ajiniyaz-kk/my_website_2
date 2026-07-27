import React, { useState } from "react";
import { AppTab, UserProfile, ThemeMode } from "../types";
import {
  BookOpen,
  MessageSquare,
  PenTool,
  FileText,
  Headphones,
  Award,
  Sparkles,
  Zap,
  RotateCcw,
  BarChart2,
  X,
  Newspaper,
  User,
  Sun,
  Moon,
  Laptop,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  userStats: {
    totalWordsLearned: number;
    quizAccuracy: number;
    completedUnitsCount: number;
    totalCorrectAnswers?: number;
    totalQuestionsAnswered?: number;
  };
  onResetStats?: () => void;
  userProfile: UserProfile;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  onOpenAuthModal: (tab?: "profile" | "login" | "register" | "settings") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userStats,
  onResetStats,
  userProfile,
  themeMode,
  setThemeMode,
  onOpenAuthModal,
}) => {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: "units",
      label: "Sózlik Unitler",
      icon: <BookOpen className="w-4 h-4" />,
      badge: "Sózlik",
    },
    {
      id: "speaking",
      label: "Söylesiw (Speaking)",
      icon: <MessageSquare className="w-4 h-4" />,
      badge: "AI Chat",
    },
    {
      id: "writing",
      label: "Jazıw (Writing)",
      icon: <PenTool className="w-4 h-4" />,
      badge: "30 Ball",
    },
    {
      id: "reading",
      label: "Oqıw (Reading)",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "listening",
      label: "Tıńlaw (Listening)",
      icon: <Headphones className="w-4 h-4" />,
    },
    {
      id: "news",
      label: "Jańalıqlar & Resurslar",
      icon: <Newspaper className="w-4 h-4" />,
      badge: "Jańa",
    },
    {
      id: "sertifikat",
      label: "Sertifikat Sınavı",
      icon: <Award className="w-4 h-4" />,
      badge: "Info",
    },
  ];

  // Quick toggle theme function
  const cycleTheme = () => {
    if (themeMode === "system") setThemeMode("dark");
    else if (themeMode === "dark") setThemeMode("light");
    else setThemeMode("system");
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 relative md:sticky md:top-0 z-50 backdrop-blur-md bg-opacity-95 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-3 gap-2 sm:gap-3">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <span className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  TR
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Qaraqalpaq - Túrk Tili AI
                </h1>
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 animate-pulse" /> Gemini 3.6
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400">
                Shet tillerin biliw sertifikatı (CEFR / TÖMER) ushın AI tayarlanıw
              </p>
            </div>
          </div>

          {/* Right Controls: Stats, Quick Theme Switcher & User Profile Menu */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* User Live Performance Stats */}
            <button
              type="button"
              onClick={() => setShowStatsModal(true)}
              title="Tolıq statistikany kóriw yaki nollew"
              className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs bg-slate-800/80 hover:bg-slate-800 rounded-xl p-1.5 sm:p-2 px-2.5 sm:px-3 border border-slate-700/60 hover:border-cyan-500/50 transition cursor-pointer group"
            >
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-400 hidden md:inline">Yodlanǵan:</span>
                <span className="font-bold text-slate-100">
                  {userStats.totalWordsLearned}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 hidden md:inline">Durıslıq:</span>
                <span className="font-bold text-emerald-400">
                  {userStats.quizAccuracy}%
                </span>
              </div>
            </button>

            {/* Quick Device Theme Switcher (Req 1) */}
            <button
              onClick={cycleTheme}
              className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-amber-400 transition cursor-pointer flex items-center justify-center shrink-0"
              title={`Sayt Teması: ${themeMode.toUpperCase()} (Tugmeni basıp almasıstırıń)`}
            >
              {themeMode === "dark" ? (
                <Moon className="w-4 h-4 text-cyan-300" />
              ) : themeMode === "light" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Laptop className="w-4 h-4 text-blue-400" />
              )}
            </button>

            {/* User Profile & Auth Menu (Req 2) */}
            <div className="relative">
              {userProfile.isLoggedIn ? (
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl p-1 sm:p-1.5 pr-2.5 transition cursor-pointer"
                >
                  <img
                    src={
                      userProfile.avatarUrl ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                    }
                    alt={userProfile.name}
                    className="w-7 h-7 rounded-lg object-cover bg-slate-900 border border-cyan-500/40"
                  />
                  <span className="text-xs font-bold text-slate-100 max-w-[100px] truncate hidden md:inline">
                    {userProfile.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuthModal("login")}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-lg shadow-cyan-600/20 transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Kiriw</span>
                </button>
              )}

              {/* Profile Dropdown Popup */}
              {showProfileMenu && userProfile.isLoggedIn && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-scale-up"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div className="p-2 border-b border-slate-800">
                    <p className="font-extrabold text-white truncate">
                      {userProfile.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {userProfile.emailOrPhone}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                      {userProfile.targetLevel} Maqset
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuthModal("profile");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl text-slate-200 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Jeke Kabinet & Stat</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuthModal("settings");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl text-slate-200 flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sazlamalar & Tema</span>
                  </button>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAuthModal("profile");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-950/40 text-rose-300 rounded-xl flex items-center space-x-2 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Shıǵıw</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-2 pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-md font-semibold ${
                      isActive
                        ? "bg-blue-800 text-blue-100"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED STATS & PERSISTENCE MODAL */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 text-slate-100">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Anıq Statistika (Real-Time)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Barlıq nátiyjeler brauzerde avtomat saqlanadı
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400 block">
                  Yodlanǵan unikal sózler
                </span>
                <span className="text-2xl font-extrabold text-amber-400">
                  {userStats.totalWordsLearned}
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400 block">
                  Umumiylik Durıslıq Procenti
                </span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {userStats.quizAccuracy}%
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400 block">
                  Ótilgen Unikal Unitler
                </span>
                <span className="text-2xl font-extrabold text-cyan-400">
                  {userStats.completedUnitsCount}
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400 block">
                  Jámı Sorawlar / Juwaplar
                </span>
                <span className="text-xl font-extrabold text-slate-200">
                  {userStats.totalCorrectAnswers ?? userStats.totalWordsLearned} /{" "}
                  {userStats.totalQuestionsAnswered ?? userStats.totalWordsLearned}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="flex items-center text-cyan-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Avto-Saqlanıw Rejimi:
              </p>
              <p>
                Saytqa jańalaw (refresh) berilgende yaki basqa waqıtta barlıq unit testler nátiyjeleri avtomat saqlanıp turadı.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              {onResetStats ? (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Barlıq statistikanı nólge qaytarıwdı qáleysiz be?"
                      )
                    ) {
                      onResetStats();
                      setShowStatsModal(false);
                    }
                  }}
                  className="bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-semibold text-xs py-2 px-3 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Statistikanı Nóllew</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => setShowStatsModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                Jabıw
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
