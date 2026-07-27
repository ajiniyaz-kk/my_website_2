import React, { useState } from "react";
import { UserProfile, ThemeMode } from "../types";
import {
  User,
  LogOut,
  Settings,
  Sun,
  Moon,
  Laptop,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  Bell,
  Award,
  ChevronRight,
  KeyRound,
  Edit3,
  Check,
} from "lucide-react";

interface AuthAndProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  initialTab?: "profile" | "login" | "register" | "settings";
  onRegisteredUserAdd?: (newUser: UserProfile) => void;
}

const REGISTERED_USERS_KEY = "tr_app_registered_users_v1";

export const AuthAndProfileModal: React.FC<AuthAndProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  setUserProfile,
  themeMode,
  setThemeMode,
  initialTab = "profile",
  onRegisteredUserAdd,
}) => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "login" | "register" | "settings"
  >(
    !userProfile.isLoggedIn && (initialTab === "profile" || initialTab === "settings")
      ? "login"
      : initialTab
  );

  // Auth Form States
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | "google">(
    "email"
  );
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("+998 ");

  // Verification OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editTargetLevel, setEditTargetLevel] = useState(userProfile.targetLevel);
  const [editDailyGoal, setEditDailyGoal] = useState(userProfile.dailyGoalWords);

  if (!isOpen) return null;

  // Helper to save user to registered users array in localStorage
  const saveUserToStorage = (newUser: UserProfile) => {
    try {
      const existing = localStorage.getItem(REGISTERED_USERS_KEY);
      let list = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(list)) list = [];

      const idx = list.findIndex((u: any) => u.emailOrPhone === newUser.emailOrPhone);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...newUser, status: "online" };
      } else {
        list.unshift({ ...newUser, status: "online" });
      }
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
      if (onRegisteredUserAdd) onRegisteredUserAdd(newUser);
    } catch (e) {
      console.error("Error storing registered user:", e);
    }
  };

  // Handle Email & Password Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError("Iltimass, barlıq maydonlardı toltırıń!");
      return;
    }

    const isAdminLogin = emailInput.toLowerCase().includes("admin");

    const updatedUser: UserProfile = {
      ...userProfile,
      isLoggedIn: true,
      id: `usr_${Date.now()}`,
      name: isAdminLogin ? "Super Admin" : emailInput.split("@")[0] || "Paydalanıwshı",
      emailOrPhone: emailInput,
      authProvider: "email",
      role: isAdminLogin ? "admin" : "user",
      status: "online",
      avatarUrl: isAdminLogin
        ? "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emailInput)}`,
    };

    setUserProfile(updatedUser);
    saveUserToStorage(updatedUser);
    setAuthSuccessMsg(isAdminLogin ? "Admin rejiminde kirdińiz!" : "Tabıslı kirdińiz!");
    setTimeout(() => {
      setAuthSuccessMsg("");
      onClose();
    }, 800);
  };

  // Handle Admin Quick Login Button
  const handleAdminQuickLogin = () => {
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
    saveUserToStorage(adminUser);
    setAuthSuccessMsg("👑 Admin Is Stolına tabıslı kirdińiz!");
    setTimeout(() => {
      setAuthSuccessMsg("");
      onClose();
    }, 800);
  };

  // Handle Step 1: Initiate Email / Password Register with OTP Verification Code
  const handleInitiateEmailRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!nameInput.trim() || !emailInput.trim() || !passwordInput.trim()) {
      setAuthError("Iltimass, atıńız, email hám paroldı kiriting!");
      return;
    }

    // Generate random 4 digit code for Email Verification
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);

    const newUser: UserProfile = {
      isLoggedIn: false,
      id: `usr_${Date.now()}`,
      name: nameInput,
      emailOrPhone: emailInput,
      authProvider: "email",
      role: "user",
      status: "online",
      targetLevel: "B2",
      dailyGoalWords: 30,
      joinDate: new Date().toISOString().split("T")[0],
      notificationsEnabled: true,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nameInput)}`,
    };

    setPendingUser(newUser);
    setOtpSent(true);
  };

  // Handle Step 2: Verify Email OTP Code
  const handleVerifyEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCodeInput.trim() !== generatedCode && otpCodeInput.trim() !== "8492" && otpCodeInput.trim() !== "1234") {
      setAuthError("⚠️ Kod qátew kiritildi! Iltimass, ekrandagı durıs kodtı kiriting.");
      return;
    }

    if (pendingUser) {
      const verifiedUser = { ...pendingUser, isLoggedIn: true, status: "online" as const };
      setUserProfile(verifiedUser);
      saveUserToStorage(verifiedUser);
      setAuthSuccessMsg("✅ Email tabıslı tastıyıqlandı! Akkaunt jaratıldı.");
      setTimeout(() => {
        setAuthSuccessMsg("");
        setOtpSent(false);
        setPendingUser(null);
        onClose();
      }, 1000);
    }
  };

  // Handle Google Auth
  const handleGoogleAuth = () => {
    const dummyName = "Ajiniyaz Xojabaev";
    const dummyEmail = "ajiniyazkhojabaev@gmail.com";

    const updatedUser: UserProfile = {
      ...userProfile,
      isLoggedIn: true,
      id: `usr_${Date.now()}`,
      name: dummyName,
      emailOrPhone: dummyEmail,
      authProvider: "google",
      role: "user",
      status: "online",
      avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    };

    setUserProfile(updatedUser);
    saveUserToStorage(updatedUser);
    setAuthSuccessMsg("Google akkauntı arqalı tabıslı kirdińiz!");
    setTimeout(() => {
      setAuthSuccessMsg("");
      onClose();
    }, 800);
  };

  // Handle Phone OTP Request & Verify
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length < 9) {
      setAuthError("Durıs telefon nomerin kiriting!");
      return;
    }
    setAuthError("");
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setOtpSent(true);
  };

  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCodeInput || otpCodeInput.length < 4) {
      setAuthError("4 xonalı SMS kodtı kiriting!");
      return;
    }

    const updatedUser: UserProfile = {
      ...userProfile,
      isLoggedIn: true,
      id: `usr_${Date.now()}`,
      name: `Paydalanıwshı (${phoneInput.slice(-4)})`,
      emailOrPhone: phoneInput,
      authProvider: "phone",
      role: "user",
      status: "online",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(phoneInput)}`,
    };

    setUserProfile(updatedUser);
    saveUserToStorage(updatedUser);
    setAuthSuccessMsg("Telefon nomerı arqalı tabıslı kirdińiz!");
    setTimeout(() => {
      setAuthSuccessMsg("");
      setOtpSent(false);
      onClose();
    }, 800);
  };

  // Save Profile Changes
  const handleSaveProfileChanges = () => {
    setUserProfile((prev) => ({
      ...prev,
      name: editName,
      targetLevel: editTargetLevel,
      dailyGoalWords: editDailyGoal,
    }));
    setIsEditingProfile(false);
  };

  // Handle Logout
  const handleLogout = () => {
    setUserProfile((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
    setActiveTab("login");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-slate-100 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar relative">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODAL HEADER TABS */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4 pr-10">
          {userProfile.isLoggedIn ? (
            <>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white bg-slate-950/60"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Jeke Kabinet</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white bg-slate-950/60"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Sazlamalar</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setActiveTab("login");
                  setAuthError("");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "login"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white bg-slate-950/60"
                }`}
              >
                Akkauntqa Kiriw
              </button>

              <button
                onClick={() => {
                  setActiveTab("register");
                  setAuthError("");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "register"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white bg-slate-950/60"
                }`}
              >
                Dizimnen Ótiw
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white bg-slate-950/60"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Temalar</span>
              </button>
            </>
          )}
        </div>

        {/* FEEDBACK MESSAGES */}
        {authError && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-medium animate-shake">
            ⚠️ {authError}
          </div>
        )}
        {authSuccessMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{authSuccessMsg}</span>
          </div>
        )}

        {/* --- TAB 1: USER PROFILE VIEW --- */}
        {activeTab === "profile" && userProfile.isLoggedIn && (
          <div className="space-y-5">
            {/* USER CARD HEADER */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
              <div className="relative">
                <img
                  src={
                    userProfile.avatarUrl ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                  }
                  alt={userProfile.name}
                  className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-cyan-500/50 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-full border-2 border-slate-900" />
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-lg text-white">
                    {userProfile.name}
                  </h3>
                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {userProfile.targetLevel} Level
                  </span>
                </div>
                <p className="text-xs text-slate-400">{userProfile.emailOrPhone}</p>
                <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Kiriw usulı:{" "}
                    {userProfile.authProvider === "google"
                      ? "Google OAuth"
                      : userProfile.authProvider === "phone"
                      ? "SMS OTP"
                      : "Email/Parol"}
                  </span>
                </div>
              </div>
            </div>

            {/* EDIT PROFILE FORM OR SUMMARY */}
            {isEditingProfile ? (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-slate-200">
                  Profil Maǵlıwmatların Ózgeritiw
                </h4>

                <div>
                  <label className="text-slate-400 block mb-1">F.I.O / Atıńız:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Sertifikat Maqsetli Dárreje (CEFR):
                  </label>
                  <div className="flex gap-2">
                    {(["A2", "B1", "B2", "C1"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEditTargetLevel(lvl)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          editTargetLevel === lvl
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                            : "bg-slate-900 text-slate-400 border-slate-800"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Gúnlik Maqsetli Yodlanatuǵın Sóz Sanı:
                  </label>
                  <select
                    value={editDailyGoal}
                    onChange={(e) => setEditDailyGoal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={15}>15 sóz / kúne (Baskıshıl)</option>
                    <option value={30}>30 sóz / kúne (Standart TÖMER)</option>
                    <option value={50}>50 sóz / kúne (Intensiv C1)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Biykarlaw
                  </button>
                  <button
                    onClick={handleSaveProfileChanges}
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                  >
                    Saqlaw
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Maqsetli Dárreje</span>
                  <span className="font-extrabold text-sm text-cyan-400">
                    {userProfile.targetLevel} CEFR / TÖMER
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Gúnlik Maqset</span>
                  <span className="font-extrabold text-sm text-amber-400">
                    {userProfile.dailyGoalWords} sóz / kúne
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block">Agzalıq Sene</span>
                    <span className="font-bold text-slate-200">
                      {userProfile.joinDate}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-xl flex items-center space-x-1 cursor-pointer font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ózgeritiw</span>
                  </button>
                </div>
              </div>
            )}

            {/* LOGOUT BUTTON */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={handleLogout}
                className="bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Akkaunttan Shıǵıw</span>
              </button>

              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Túsinikli
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 2: LOGIN --- */}
        {activeTab === "login" && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white">Xush Kelipsiz!</h3>
              <p className="text-xs text-slate-400">
                Oqıw nátiyjelerińizdi hám statistikańızdı barlıq devicelarda saqlaw ushın kiring.
              </p>
            </div>

            {/* ADMIN QUICK LOGIN BADGE */}
            <button
              type="button"
              onClick={handleAdminQuickLogin}
              className="w-full bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 hover:from-amber-600/40 hover:to-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs py-2.5 px-4 rounded-2xl transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
            >
              <KeyRound className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>👑 Super Admin Sıpatında Kiriw (Admin Is Stoli)</span>
            </button>

            {/* GOOGLE QUICK AUTH BUTTON */}
            <button
              onClick={handleGoogleAuth}
              className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl transition cursor-pointer flex items-center justify-center space-x-3 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google arqalı bir basıwda kiriw</span>
            </button>

            <div className="flex items-center my-2 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="px-3">yaki</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* SWITCH AUTH METHOD */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("email");
                  setAuthError("");
                }}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  authMethod === "email"
                    ? "bg-slate-800 text-cyan-300"
                    : "text-slate-400"
                }`}
              >
                Email / Parol
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("phone");
                  setAuthError("");
                }}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  authMethod === "phone"
                    ? "bg-slate-800 text-cyan-300"
                    : "text-slate-400"
                }`}
              >
                Telefon SMS
              </button>
            </div>

            {/* EMAIL LOGIN FORM */}
            {authMethod === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Email / Username:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="mysal@domain.com yaki admin@tomer.uz"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Parol:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-lg shadow-cyan-600/20"
                >
                  Akkauntqa Kiriw
                </button>
              </form>
            )}

            {/* PHONE SMS LOGIN FORM */}
            {authMethod === "phone" && (
              <div className="space-y-3 text-xs">
                {!otpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                    <div>
                      <label className="text-slate-400 block mb-1">
                        Telefon Nomerıńız:
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="+998 90 123 45 67"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      SMS Kod Yiboriw
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-3 animate-fade-in">
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-center font-semibold text-xs">
                      📩 Tastıyıqlaw kodi SMS arqalı yiborildi: <strong className="text-white text-sm font-mono">{generatedCode || "8492"}</strong>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">
                        SMS Kodi (4 xona):
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCodeInput}
                          onChange={(e) => setOtpCodeInput(e.target.value)}
                          placeholder={generatedCode || "8492"}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-center tracking-widest text-lg"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition cursor-pointer"
                    >
                      Kodtı Tastıyıqlaw hám Kiriw
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: REGISTER --- */}
        {activeTab === "register" && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white">Jańa Akkaunt Jaratıw</h3>
              <p className="text-xs text-slate-400">
                1 minut ishinde dizimnen ótiń hám barlıq TÖMER/DTM AI imkaniyatlarınan paydalanıń.
              </p>
            </div>

            {!otpSent ? (
              <form onSubmit={handleInitiateEmailRegister} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Atıńız hám Familiyańız:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Mısalı: Islam Orazbaev"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Email manzili:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="mysal@domain.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Parol:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Keminde 6 xona"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Email Verification Kodın Yiboriw & Dizimnen Ótiw</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailOtp} className="space-y-3.5 text-xs animate-fade-in">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-center font-medium">
                  <p>📩 Email manzilinizge ({pendingUser?.emailOrPhone}) tastıyıqlaw kodi yiborildi!</p>
                  <p className="mt-1 font-bold text-amber-300 text-sm">
                    Tastıyıqlaw kodi: <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40 text-white">{generatedCode || "8492"}</span>
                  </p>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">
                    Emailga kelgen 4 xonali kodti kiriting:
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCodeInput}
                      onChange={(e) => setOtpCodeInput(e.target.value)}
                      placeholder={generatedCode || "8492"}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-center tracking-widest text-xl font-black"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-3 rounded-xl transition cursor-pointer shadow-lg shadow-cyan-600/20"
                >
                  Kodtı Tastıyıqlaw hám Registraciyanı Juwmaqlaw
                </button>
              </form>
            )}
          </div>
        )}

        {/* --- TAB 4: SETTINGS & THEME --- */}
        {activeTab === "settings" && (
          <div className="space-y-5 text-xs">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <span>Sayt Sazlamaları hám Rejimler</span>
              </h3>
              <p className="text-slate-400 text-[11px]">
                Device teması, bildiriwnamalar hám platforma parametrleri
              </p>
            </div>

            {/* THEME MODE SELECTION (REQUIREMENT 1) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-slate-200 block text-xs">
                🎨 Sayt Foni hám Teması (Theme Mode):
              </label>
              <p className="text-[11px] text-slate-400">
                Qurılmańızdıń fondaǵı rejimine (Dark/Light) avtomat maslasıw yaki qolda saylaw:
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setThemeMode("system")}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                    themeMode === "system"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <Laptop className="w-5 h-5" />
                  <span>Qurılma (Auto)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode("dark")}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                    themeMode === "dark"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span>Túngi (Dark)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode("light")}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                    themeMode === "light"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-400" />
                  <span>Jaqtı (Light)</span>
                </button>
              </div>
            </div>

            {/* NOTIFICATION TOGGLE */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 block">
                  Gúnlik Eslatpa Bildiriwnamaları
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Her kúni saat 20:00 de AI sózlik eslatpaların alıw
                </span>
              </div>

              <input
                type="checkbox"
                checked={userProfile.notificationsEnabled}
                onChange={(e) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    notificationsEnabled: e.target.checked,
                  }))
                }
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                Saqlaw hám Jabıw
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
