import React, { useState } from "react";
import { RegisteredUser, UserProfile } from "../types";
import {
  Users,
  UserCheck,
  Activity,
  Shield,
  Search,
  UserPlus,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  Download,
  Sparkles,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Laptop,
  Mail,
  Phone,
  BarChart2,
  ShieldAlert,
} from "lucide-react";

interface AdminPanelProps {
  users: RegisteredUser[];
  setUsers: React.Dispatch<React.SetStateAction<RegisteredUser[]>>;
  currentUser: UserProfile;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  setUsers,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "online">("all");
  const [activeTab, setActiveTab] = useState<"users" | "activity" | "otp" | "adduser">("users");

  // New User Form State for Admin
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user");
  const [newUserLevel, setNewUserLevel] = useState<"A2" | "B1" | "B2" | "C1">("B2");
  const [newUserProvider, setNewUserProvider] = useState<"email" | "google" | "phone">("email");
  const [successMsg, setSuccessMsg] = useState("");

  // Simulated Live Activity Logs
  const [activityLogs, setActivityLogs] = useState([
    {
      id: "act_1",
      user: "Ajiniyaz Xojabaev",
      action: "Speaking (Söylesiw) B2 AI chat basladı",
      time: "Házir ǵana",
      type: "chat",
    },
    {
      id: "act_2",
      user: "Islam Orazbaev",
      action: "Unit 2: Kúnlik Tırshılıq testinen 95% aldı",
      time: "2 minut aldın",
      type: "quiz",
    },
    {
      id: "act_3",
      user: "Gulnaza Oralbaeva",
      action: "Writing (Jazıw) esse tekseriwge yibordi (28 ball)",
      time: "15 minut aldın",
      type: "writing",
    },
    {
      id: "act_4",
      user: "Sardorbek Yuldashev",
      action: "Google OAuth arqalı kirdi",
      time: "1 saat aldın",
      type: "auth",
    },
  ]);

  // Simulated OTP History
  const [otpLogs, setOtpLogs] = useState([
    {
      id: "otp_1",
      recipient: "ajiniyazkhojabaev@gmail.com",
      code: "8492",
      type: "Email Verification",
      status: "Tastıyıqlandı",
      time: "12:04",
    },
    {
      id: "otp_2",
      recipient: "+998 90 123 45 67",
      code: "3910",
      type: "SMS OTP",
      status: "Tastıyıqlandı",
      time: "11:45",
    },
    {
      id: "otp_3",
      recipient: "islam_orazbaev@mail.ru",
      code: "5129",
      type: "Email Verification",
      status: "Tastıyıqlandı",
      time: "10:12",
    },
  ]);

  // Metrics
  const totalUsers = users.length;
  const onlineUsers = users.filter((u) => u.status === "online" || u.isLoggedIn).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.emailOrPhone.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterRole === "admin") return matchesSearch && u.role === "admin";
    if (filterRole === "online") return matchesSearch && (u.status === "online" || u.isLoggedIn);
    return matchesSearch;
  });

  // Toggle User Block Status
  const handleToggleBlock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isBlocked: !u.isBlocked } : u))
    );
  };

  // Toggle User Role (Admin / User)
  const handleToggleRole = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u
      )
    );
  };

  // Delete User
  const handleDeleteUser = (id: string) => {
    if (window.confirm("Bawırım, bul paydalanıwshını shırap taslawdı qáleysiz be?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  // Add User Manually
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: RegisteredUser = {
      id: `usr_${Date.now()}`,
      name: newUserName,
      emailOrPhone: newUserEmail,
      isLoggedIn: false,
      authProvider: newUserProvider,
      targetLevel: newUserLevel,
      dailyGoalWords: 30,
      joinDate: new Date().toISOString().split("T")[0],
      notificationsEnabled: true,
      role: newUserRole,
      status: "offline",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        newUserName
      )}`,
    };

    setUsers((prev) => [newUser, ...prev]);
    setNewUserName("");
    setNewUserEmail("");
    setSuccessMsg("Jańa paydalanıwshı tabıslı qosıldı!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Export Users CSV
  const handleExportCSV = () => {
    const headers = "ID,Name,EmailOrPhone,AuthProvider,TargetLevel,JoinDate,Role,Status\n";
    const rows = users
      .map(
        (u) =>
          `"${u.id}","${u.name}","${u.emailOrPhone}","${u.authProvider}","${u.targetLevel}","${u.joinDate}","${u.role || "user"}","${u.status || "offline"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `registered_users_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-cyan-500/30">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Admin Is Stoli (Worktable)
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Platforma paydalanıwshıların basqarıw, onlayn statistika hám xáwipsizlik logları
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>CSV Ekспорт</span>
            </button>
          </div>
        </div>

        {/* METRICS METERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Jámı Dizimnen Ótkenler</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-1">{totalUsers}</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Házir Onlayn / Aktiv</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{onlineUsers}</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Admin Akkauntlar</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{adminCount}</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>OTP Tastıyıqlawlar</span>
              <KeyRound className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-blue-400 mt-1">{otpLogs.length}</p>
          </div>
        </div>
      </div>

      {/* SUB-TAB NAVIGATION */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "users"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Paydalanıwshılar Dizimi ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "activity"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Real-time Aktivlik Logs</span>
        </button>

        <button
          onClick={() => setActiveTab("otp")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "otp"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>SMS / Email OTP Logları</span>
        </button>

        <button
          onClick={() => setActiveTab("adduser")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === "adduser"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <UserPlus className="w-4 h-4 text-blue-400" />
          <span>Jańa Paydalanıwshı Qosıw</span>
        </button>
      </div>

      {/* --- TAB 1: USERS LIST TABLE --- */}
      {activeTab === "users" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Atı, Email yaki telefon nomeri arqalı izlew..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterRole("all")}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                  filterRole === "all"
                    ? "bg-slate-800 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 bg-slate-950"
                }`}
              >
                Barlıǵı
              </button>
              <button
                onClick={() => setFilterRole("online")}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                  filterRole === "online"
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 bg-slate-950"
                }`}
              >
                🟢 Házir Onlayn
              </button>
              <button
                onClick={() => setFilterRole("admin")}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                  filterRole === "admin"
                    ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 bg-slate-950"
                }`}
              >
                👑 Adminler
              </button>
            </div>
          </div>

          {/* TABLE VIEW */}
          <div className="overflow-x-auto no-scrollbar border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Paydalanıwshı</th>
                  <th className="py-3.5 px-4 font-bold">Kiriw Usulı</th>
                  <th className="py-3.5 px-4 font-bold">Dárreje</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Dizimnen Ótken Sene</th>
                  <th className="py-3.5 px-4 font-bold">Rol</th>
                  <th className="py-3.5 px-4 font-bold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      Izelengen shartler boyınsha paydalanıwshı tabılmadı.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isOnline = u.status === "online" || u.isLoggedIn;
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <img
                                src={
                                  u.avatarUrl ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
                                }
                                alt={u.name}
                                className="w-9 h-9 rounded-xl object-cover bg-slate-950 border border-slate-700"
                              />
                              {isOnline && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-white flex items-center space-x-1.5">
                                <span>{u.name}</span>
                                {u.id === currentUser.id && (
                                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold">
                                    Siz
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block">
                                {u.emailOrPhone}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                            {u.authProvider === "google" && "Google Auth"}
                            {u.authProvider === "email" && "Email/Password"}
                            {u.authProvider === "phone" && "SMS Verification"}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-cyan-400">
                          {u.targetLevel}
                        </td>

                        <td className="py-3 px-4">
                          {u.isBlocked ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <XCircle className="w-3 h-3 mr-1" /> Bloklanǵan
                            </span>
                          ) : isOnline ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />{" "}
                              Onlayn
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              Offlayn
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {u.joinDate || "2026-07-26"}
                        </td>

                        <td className="py-3 px-4">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Admin
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Paydalanıwshı</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleToggleRole(u.id)}
                              title="Rolni ozgeritiw (Admin/User)"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition cursor-pointer"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleBlock(u.id)}
                              title={u.isBlocked ? "Bloktan shıǵarıw" : "Bloklaw"}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                u.isBlocked
                                  ? "bg-emerald-950 text-emerald-300 hover:bg-emerald-900"
                                  : "bg-slate-800 text-rose-400 hover:bg-slate-700"
                              }`}
                            >
                              {u.isBlocked ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              title="Óshiriw"
                              className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: REAL-TIME ACTIVITY LOGS --- */}
      {activeTab === "activity" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Sitiyadaǵı Sońǵı Háreketler Streamı</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Avtomat jańalanıp turadı
            </span>
          </div>

          <div className="space-y-2.5">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-900 rounded-xl text-cyan-400 border border-slate-800">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white mr-2">
                      {log.user}:
                    </span>
                    <span className="text-slate-300">{log.action}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium shrink-0 ml-2">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: OTP VERIFICATION HISTORY --- */}
      {activeTab === "otp" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Yiborilǵan SMS hám Email Verification Kodi Logları</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Xáwipsizlik tekseriwi
            </span>
          </div>

          <div className="space-y-2.5">
            {otpLogs.map((otp) => (
              <div
                key={otp.id}
                className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">
                      {otp.recipient}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Túri: {otp.type} | Kodi:{" "}
                      <strong className="text-amber-300 font-mono">{otp.code}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {otp.status}
                  </span>
                  <span className="text-slate-500 text-[11px]">{otp.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: ADD USER FORM --- */}
      {activeTab === "adduser" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 max-w-xl mx-auto shadow-xl">
          <h3 className="font-black text-lg text-white flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <span>Jańa Paydalanıwshını Qolda Qosıw</span>
          </h3>

          {successMsg && (
            <div className="p-3 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddUser} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">F.I.O / Atı Familiyası:</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Mısalı: Oralbaeva Perizat"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Email yaki Telefon:</label>
              <input
                type="text"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="perizat@domain.com yaki +998 91 234 56 78"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Roli:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as "user" | "admin")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="user">Paydalanıwshı (User)</option>
                  <option value="admin">Administrator (Admin)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">CEFR Maqset:</label>
                <select
                  value={newUserLevel}
                  onChange={(e) => setNewUserLevel(e.target.value as "A2" | "B1" | "B2" | "C1")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="A2">A2 Level</option>
                  <option value="B1">B1 Level</option>
                  <option value="B2">B2 Level (Standart)</option>
                  <option value="C1">C1 Level</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-lg shadow-blue-600/30"
            >
              Paydalanıwshını Saqlaw
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
