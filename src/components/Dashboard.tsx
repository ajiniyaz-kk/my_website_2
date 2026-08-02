import React from "react";
import { UserProfile, UserStats, AppTab } from "../types";
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  FileEdit,
  Headphones,
  Award,
  Newspaper,
  Flame,
  Target,
  Trophy,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface DashboardProps {
  userProfile: UserProfile;
  userStats: UserStats;
  onSelectTab: (tab: AppTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  userStats,
  onSelectTab,
}) => {
  // Calculate daily goal progress percentage
  const wordsLearnedToday = Math.min(
    userStats.totalWordsLearned % (userProfile.dailyGoalWords || 30),
    userProfile.dailyGoalWords || 30
  );
  const dailyProgressPercent = Math.min(
    Math.round((wordsLearnedToday / (userProfile.dailyGoalWords || 30)) * 100),
    100
  );

  // Smart Recommendation Logic
  const getRecommendation = () => {
    if (userStats.quizzesCompleted === 0) {
      return {
        title: "Sózlik Bóliminen Baslań!",
        description:
          "Siz ele bir de sózlik unit testin tapsırmadıńız. TÖMER & DTM dárejeńizdi oshırıw ushın eń birinshi A1/A2 sózlik birikpelerin ózlestiriń.",
        actionText: "Sózlik Unitlerge Ótiw",
        targetTab: "units" as AppTab,
        icon: <BookOpen className="w-6 h-6 text-cyan-400" />,
        gradient: "from-cyan-500/20 to-blue-500/20 border-cyan-500/40",
      };
    } else if (userStats.averageAccuracy < 70) {
      return {
        title: "Tıńlaw hám Túsiniwdi Balamlaw!",
        description:
          "Durıslıq kórsetkishińizdi 80%+ ga jetkiziw ushın Tıńlaw (Listening) bóliminde turksha audio tekstlerdi tıńlap shınıǵıń.",
        actionText: "Tıńlaw Bólimine Ótiw",
        targetTab: "listening" as AppTab,
        icon: <Headphones className="w-6 h-6 text-purple-400" />,
        gradient: "from-purple-500/20 to-indigo-500/20 border-purple-500/40",
      };
    } else {
      return {
        title: "AI Bilen Erkin Sóylesiń!",
        description:
          "Sózlik qorıńız hám test nátiyjelerińiz joqarı! Endi AI Túrk Tili Repetitorı penen erkin tema-xat sóylesip, sóylew kónlikpesin bekkemleń.",
        actionText: "AI Sóylesiw Tutori Penen Sóylesiw",
        targetTab: "speaking" as AppTab,
        icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
        gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40",
      };
    }
  };

  const recommendation = getRecommendation();

  const quickAccessModules = [
    {
      id: "units" as AppTab,
      title: "Sózlik Unitler",
      description: "A1-C1 dárejedegi tema sózlikler hám interaktiv testler",
      badge: "Tema Sózlikler",
      icon: <BookOpen className="w-6 h-6 text-cyan-400" />,
      color: "hover:border-cyan-500/50 hover:shadow-cyan-500/10",
    },
    {
      id: "speaking" as AppTab,
      title: "AI Sóylesiw Tutori",
      description: "AI penen real vaqtta sóylesiw, grammatika taldawı",
      badge: "Live Voice & Chat",
      icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
      color: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    },
    {
      id: "writing" as AppTab,
      title: "Jazıw Baha Beriw",
      description: "Insho ham esse jazıp, AI dan avtomat baha hám grena alıń",
      badge: "AI Evaluator",
      icon: <FileEdit className="w-6 h-6 text-amber-400" />,
      color: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    },
    {
      id: "reading" as AppTab,
      title: "Oqıw (Reading)",
      description: "Túrksha maqalalar, lugat túsindirmeleri hám sorawlar",
      badge: "TÖMER Tekstler",
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      color: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    },
    {
      id: "listening" as AppTab,
      title: "Tıńlaw (Listening)",
      description: "Audio dialoglar, sorawlar hám túrksha sóylesivler",
      badge: "Audio Dialoglar",
      icon: <Headphones className="w-6 h-6 text-purple-400" />,
      color: "hover:border-purple-500/50 hover:shadow-purple-500/10",
    },
    {
      id: "sertifikat" as AppTab,
      title: "Sertifikat Sınawı",
      description: "DTM hám TÖMER xalqara daraja tayarlıq sınawları",
      badge: "DTM & TÖMER",
      icon: <Award className="w-6 h-6 text-rose-400" />,
      color: "hover:border-rose-500/50 hover:shadow-rose-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. XUSH KELIBSIZ BLOKI (Welcome Hero Card) */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Qaraqalpaq - Túrk Tili TÖMER & DTM AI Platforması</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Qaytadan xosh keldińiz,{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                {userProfile.name}
              </span>
              ! 👋
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Búgingi oqıw maqsetlerińizge erisiw ushın shınıǵıwlardı dawam etiń.
              Jeke AI assistentińiz sizge hár qádemde járdem beriwge tayar!
            </p>
          </div>

          {/* User Level & Goal Stats Badge Box */}
          <div className="w-full md:w-auto bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-medium">
                Maqsetli Dáreje:
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black">
                {userProfile.targetLevel || "B2"} Dáreje
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kúnlik Maqset Progressı:</span>
                </span>
                <span className="text-cyan-400 font-bold">
                  {wordsLearnedToday} / {userProfile.dailyGoalWords || 30} sóz
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UMUMIY STATISTIKA KARTALARI (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Words Learned */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 hover:border-cyan-500/40 transition shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Yodlanǵan Sózler
            </span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {userStats.totalWordsLearned}
            </span>
            <span className="text-slate-400 text-xs">sóz</span>
          </div>
          <p className="text-emerald-400 text-[11px] font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>A1-C1 bazasınan jıynaldı</span>
          </p>
        </div>

        {/* Card 2: Average Accuracy */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 hover:border-emerald-500/40 transition shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Durıslıq Kórsetkishi
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {userStats.averageAccuracy}%
            </span>
          </div>
          <p className="text-slate-400 text-[11px] font-medium">
            Testler ortasha durıslıǵı
          </p>
        </div>

        {/* Card 3: Completed Units */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 hover:border-blue-500/40 transition shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Ótilgen Testler
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {userStats.quizzesCompleted}
            </span>
            <span className="text-slate-400 text-xs">seans</span>
          </div>
          <p className="text-slate-400 text-[11px] font-medium">
            Sózlik hám gramatika sınawları
          </p>
        </div>

        {/* Card 4: Streak Days */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2 hover:border-amber-500/40 transition shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Izbe-iz Kúnler (Streak)
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              {userStats.currentStreakDays || 1}
            </span>
            <span className="text-slate-400 text-xs">kún</span>
          </div>
          <p className="text-amber-300/80 text-[11px] font-medium">
            🔥 Faol kúnler seriyası
          </p>
        </div>
      </div>

      {/* 3. "KEYINGI QADAM" TAVSIYASI BLOKI (Recommendation Card) */}
      <div
        className={`bg-slate-900 border ${recommendation.gradient} p-6 rounded-3xl relative overflow-hidden shadow-xl transition-all hover:border-opacity-80`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
              {recommendation.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  💡 Aqıllı Usınıs (Keyingi Qadam)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {recommendation.title}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                {recommendation.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTab(recommendation.targetTab)}
            className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20"
          >
            <span>{recommendation.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. TEZ KİRIW KARTALARI (Quick Access Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Tez Kiriw Bólimleri</span>
          </h2>
          <span className="text-xs text-slate-400">
            Kerekli bólimge birmomentte ótiń
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickAccessModules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => onSelectTab(mod.id)}
              className={`bg-slate-900 border border-slate-800 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 ${mod.color} group relative overflow-hidden shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 group-hover:scale-105 transition">
                  {mod.icon}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {mod.badge}
                </span>
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition">
                  {mod.title}
                </h3>
                <p className="text-slate-400 text-xs line-clamp-2">
                  {mod.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium opacity-80 group-hover:opacity-100">
                <span>Bólimge ótiw</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
