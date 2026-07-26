import React, { useState, useRef, useEffect } from "react";
import { SpeakingMessage } from "../types";
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  RefreshCw,
  HelpCircle,
  Copy,
  Check,
  UserCheck,
  Bot,
  Zap,
} from "lucide-react";

export const SpeakingTutor: React.FC = () => {
  const [topic, setTopic] = useState("Özbekistan ve Türkiye Kültürel Bağları");
  const [cefrLevel, setCefrLevel] = useState<"A2" | "B1" | "B2" | "C1">("B2");
  const [persona, setPersona] = useState<"Aylin" | "Examiner" | "TourGuide">("Aylin");
  const [speechRate, setSpeechRate] = useState<number>(0.95);

  const [messages, setMessages] = useState<SpeakingMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Merhaba! Ben Aylin, senin Türkçe konuşma ve mülakat arkadaşınım. Bugün hangi konu hakkında sohbet etmek veya pratik yapmak istersin?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [inputContent, setInputContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Speech Synthesis
  const speakText = (text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    utterance.rate = speechRate;
    window.speechSynthesis.speak(utterance);
  };

  // Microphone Web Speech Recognition API
  const toggleMicInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Siziń brauzerıńızda mikrofondan daus penen jazıw imkoniyatı joq. Iltimass, tekst túrinde jazıń.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputContent((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.start();
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputContent;
    if (!text.trim() || isSending) return;

    const userMsg: SpeakingMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputContent("");
    setIsSending(true);

    try {
      const response = await fetch("/api/speaking/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          topic: `${persona === "Examiner" ? "[TÖMER Sınavı Mülakatı] " : persona === "TourGuide" ? "[İstanbul Rehberi] " : "[Aylin AI Tutor] "}${topic}`,
          cefrLevel,
        }),
      });

      const data = await response.json();

      const aiMsg: SpeakingMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.replyTurkish || "Çok güzel söylediniz, lütfen devam edin!",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        feedback: {
          grammarKarakalpak:
            data.grammarFeedbackKarakalpak ||
            "Grammatikalıq durıslıq baǵalandı.",
          betterPhrases: data.betterPhrasesTurkish || [],
          cefrEstimate: data.CEFRScoreEstimate || cefrLevel,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiMsg.content);
    } catch (err) {
      console.error(err);
      const fallbackMsg: SpeakingMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content:
          "Çok güzel düşünceler! Peki bu konuda daha detaylı ne eklemek istersiniz?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Instant Translation helper
  const handleTranslateMessage = async (msgId: string, turkishText: string) => {
    if (translations[msgId]) return;
    setTranslatingId(msgId);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textTurkish: turkishText }),
      });
      const data = await res.json();
      setTranslations((prev) => ({
        ...prev,
        [msgId]: data.translationKarakalpak || "Awdarma tayarlandı.",
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setTranslatingId(null);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset chat
  const handleResetChat = () => {
    const greeting =
      persona === "Examiner"
        ? "Merhaba, Ben DTM Türkçe Sertifika Sınavı Komisyon Üyesiyim. Mülakatımıza başlayabiliriz."
        : persona === "TourGuide"
        ? "Merhaba! İstanbul Gezi Rehberinizim. İstanbul tarihi ve kültürü hakkında neler öğrenmek istersiniz?"
        : "Merhaba! Ben Aylin. Samimi Türkçe sohbet arkadaşınım. Bugün ne hakkında konuşalım?";

    setMessages([
      {
        id: "init-1",
        role: "assistant",
        content: greeting,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>AI Səwbetshi (Türkçe Konuşma AI Tutor)</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Turaqlı Səwbetlesiw hám Awızsha Sınaw AI
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Túrk tilinde erkin hám shabdossha sóylesiw, awızsha sınav (Speaking) mülakatına tayarlanıw hám daus penen tábiyiy dialóg alıp barıw.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Suhbatı Jańalaw</span>
            </button>
          </div>
        </div>

        {/* CONTROLS ROW */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">
              Səwbetlesiw Personası:
            </label>
            <select
              value={persona}
              onChange={(e: any) => {
                setPersona(e.target.value);
                handleResetChat();
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="Aylin">🌸 Aylin - Túrk tili dostı hám mugallimi</option>
              <option value="Examiner">🎓 DTM / TÖMER Sınawshı Komissiyası</option>
              <option value="TourGuide">🕌 İstanbul Turizm hám Sawda Zıyratı</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">
              Mülakat Teması:
            </label>
            <select
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                handleResetChat();
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="Kendini ve Aileyi Tanıtma">
                1. Kendini ve Aileyi Tanıtma (A1-A2)
              </option>
              <option value="Özbekistan ve Türkiye Kültürel Bağları">
                2. Özbekistan ve Türkiye Kültürel Bağları (B1-B2)
              </option>
              <option value="Eğitim ve Geleceğin Meslekleri">
                3. Eğitim ve Geleceğin Meslekleri (B2-C1)
              </option>
              <option value="Çevre Sorunları ve Küresel Isınma">
                4. Çevre Sorunları ve Küresel Isınma (B2-C1)
              </option>
              <option value="İstanbul Seyahati ve Alışveriş">
                5. İstanbul Seyahati ve Alışveriş (B1-B2)
              </option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">
              Maqsetli CEFR Level:
            </label>
            <div className="flex gap-1">
              {(["A2", "B1", "B2", "C1"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCefrLevel(lvl)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    cefrLevel === lvl
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">
              AI Dausı Tızligi (Speech Rate):
            </label>
            <div className="flex gap-1">
              {[
                { r: 0.8, l: "Áste" },
                { r: 0.95, l: "Normal" },
                { r: 1.1, l: "Tez" },
              ].map((sp) => (
                <button
                  key={sp.r}
                  onClick={() => setSpeechRate(sp.r)}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
                    speechRate === sp.r
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  {sp.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK PRESET PROMPTS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs text-slate-400 font-semibold shrink-0">
          ⚡ Suxbatı baslaw ushın ápiwayı gápler:
        </span>
        {[
          "Merhaba, kendimi tanıtmak istiyorum.",
          "Özbekistan ve Özbek kültürü hakkında konuşalım.",
          "İstanbul'da gezilecek yerleri tavsiye eder misin?",
          "B2 seviyesi sınavı için örnek soru sorar mısın?",
        ].map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(promptText)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-xl px-3 py-1.5 whitespace-nowrap transition cursor-pointer shrink-0"
          >
            "{promptText}"
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES DISPLAY */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl min-h-[480px] flex flex-col justify-between">
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 shadow-md text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[11px] opacity-75 border-b border-white/10 pb-1 mb-1">
                  <span className="font-bold flex items-center gap-1">
                    {msg.role === "assistant" ? (
                      <>
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        {persona === "Examiner"
                          ? "DTM Sınawshı AI"
                          : persona === "TourGuide"
                          ? "İstanbul Rehberi AI"
                          : "Aylin AI Tutor"}
                      </>
                    ) : (
                      "Siz (Kandidat)"
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap font-sans">{msg.content}</p>

                {/* TRANSLATION IF AVAILABLE */}
                {translations[msg.id] && (
                  <div className="mt-2 p-2.5 bg-slate-900/90 rounded-xl border border-cyan-500/30 text-xs text-cyan-200 italic">
                    <strong>Qaraqalpaqsha:</strong> {translations[msg.id]}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60 text-[11px]">
                    <button
                      onClick={() => speakText(msg.content)}
                      className="text-slate-400 hover:text-cyan-400 flex items-center space-x-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Tıńlaw</span>
                    </button>

                    <button
                      onClick={() => handleTranslateMessage(msg.id, msg.content)}
                      disabled={translatingId === msg.id}
                      className="text-slate-400 hover:text-amber-400 flex items-center space-x-1 cursor-pointer"
                    >
                      {translatingId === msg.id ? (
                        <span>Awdarılmaqta...</span>
                      ) : (
                        <span>Qaraqalpaqsha Awdarması</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === msg.id ? "Kóshirildi" : "Kóshiriw"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* GRAMMAR & EVALUATION CARD */}
              {msg.feedback && (
                <div className="max-w-2xl mt-2 bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
                  <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1.5">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Grammatika hám CEFR
                      Talıllawı
                    </span>
                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded text-[10px] text-cyan-300 border border-cyan-500/20">
                      Boǵalanǵan dárreje: {msg.feedback.cefrEstimate}
                    </span>
                  </div>

                  <p className="text-slate-300">
                    <strong className="text-amber-400">
                      Qaraqalpaqsha Pikir:
                    </strong>{" "}
                    {msg.feedback.grammarKarakalpak}
                  </p>

                  {msg.feedback.betterPhrases &&
                    msg.feedback.betterPhrases.length > 0 && (
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="font-bold text-emerald-400 block">
                          Jaqsıraq Túrkce ańlatpa usınısları:
                        </span>
                        {msg.feedback.betterPhrases.map((phrase, idx) => (
                          <p key={idx} className="italic text-slate-200">
                            • "{phrase}"
                          </p>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-center space-x-2 text-xs text-cyan-400 bg-slate-950 p-3 rounded-2xl w-fit border border-slate-800 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
              <span>AI Səwbetshi juwap jazatır hám grammatikany tekserip atır...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* INPUT BAR WITH MICROPHONE & VOICE INDICATOR */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMicInput}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-center ${
                isListening
                  ? "bg-red-500 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/30"
                  : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800"
              }`}
              title="Daus penen sóylew (Microphone)"
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5 text-cyan-400" />
              )}
            </button>

            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }, 150);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Túrk tilinde juwabıńızdı jazıń yaki mikrofondan aytıń..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white text-xs sm:text-sm rounded-2xl px-4 py-3.5 focus:outline-none transition"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputContent.trim() || isSending}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white p-3.5 rounded-2xl shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
