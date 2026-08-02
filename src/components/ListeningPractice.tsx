import React, { useState, useRef, useEffect } from "react";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload,
  Plus,
  Trash2,
  Music,
  FileAudio,
  Sparkles,
  HelpCircle,
  X,
} from "lucide-react";

export interface CustomQuestion {
  id: number;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface ListeningTrack {
  id: string;
  title: string;
  level: string;
  transcript: string;
  audioUrl?: string; // Real audio blob URL or URL
  isCustom?: boolean;
  questions: CustomQuestion[];
}

const CUSTOM_TRACKS_STORAGE_KEY = "tr_app_custom_listening_tracks_v1";

export const ListeningPractice: React.FC = () => {
  const initialDefaultTracks: ListeningTrack[] = [
    {
      id: "l1",
      title: "1-Audıo: İstanbul'da Otel Rezervasyonu Yapma",
      level: "A2-B1",
      transcript:
        "Resepsiyonist: İyi günler, Sultanahmet Oteli'ne hoş geldiniz. Size nasıl yardımcı olabilirim?\nMüşteri: Merhaba! Önümüzdeki hafta cuma günü için iki kişilik bir oda ayırtmak istiyorum.\nResepsiyonist: Tabii ki efendim. Kaç gece konaklayacaksınız?\nMüşteri: Toplam üç gece kalacağız. Oda kahvaltı dahil mi acaba?\nResepsiyonist: Evet, sabah kahvaltısı açık büfe olarak fiyata dahildir.",
      questions: [
        {
          id: 1,
          q: "Müşteri hangi gün için otel rezervasyonu yaptırmak istiyor?",
          options: ["A) Perşembe", "B) Cuma", "C) Cumartesi", "D) Pazartesi"],
          correct: 1,
          explanation: "Müşteri 'cuma günü için' rezervasyon yaptırmak istediğini belirtiyor.",
        },
        {
          id: 2,
          q: "Konaklama süresine sabah kahvaltısı dahil midir?",
          options: [
            "A) Hayır, ekstra ücrete tabidir",
            "B) Evet, açık büfe olarak dahildir",
            "C) Sadece hafta sonu dahildir",
            "D) Resepsiyonist bilgi vermedi",
          ],
          correct: 1,
          explanation: "Resepsiyonist kahvaltının fiyata dahil olduğunu söyledi.",
        },
      ],
    },
    {
      id: "l2",
      title: "2-Audıo: Üniversite Kütüphanesi ve Araştırma",
      level: "B2",
      transcript:
        "Öğrenci: Danışman öğretmenim, tez çalışmam için Osmanlı dönemi kaynaklarına ulaşmam gerekiyor.\nKütüphaneci: Kütüphanemizin dijital arşiv bölümünde üçüncü katta nadir eserler koleksiyonu bulunmaktadır. Kimlik kartınızla giriş yapıp dijital tarama yapabilirsiniz.",
      questions: [
        {
          id: 1,
          q: "Öğrenci hangi dönem kaynaklarına ulaşmak istemektedir?",
          options: ["A) Selçuklu", "B) Osmanlı", "C) Cumhuriyet", "D) Göktürk"],
          correct: 1,
          explanation: "Öğrenci 'Osmanlı dönemi kaynaklarına' ulaşması gerektiğini söyledi.",
        },
      ],
    },
  ];

  // Load stored custom audio tracks from localStorage
  const loadCustomTracks = (): ListeningTrack[] => {
    try {
      const stored = localStorage.getItem(CUSTOM_TRACKS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load custom tracks", e);
    }
    return [];
  };

  const [customTracks, setCustomTracks] = useState<ListeningTrack[]>(loadCustomTracks);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // New track form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState("B1");
  const [newTranscript, setNewTranscript] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [newQuestions, setNewQuestions] = useState<
    { q: string; optA: string; optB: string; optC: string; optD: string; correct: number; exp: string }[]
  >([
    {
      q: "Audıo mazmunı boyınsha durıs juvaptı saylań:",
      optA: "A) Birinshi opsiya",
      optB: "B) Ekinshi opsiya",
      optC: "C) Úshinshi opsiya",
      optD: "D) Törtinshi opsiya",
      correct: 0,
      exp: "Audıoda aytılǵan maǵlıwmatqa qaranda durıs juvap уusı.",
    },
  ]);

  const allTracks = [...initialDefaultTracks, ...customTracks];
  const currentTrack = allTracks[activeTrackIndex] || allTracks[0];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync playback speed with HTML5 audio or SpeechSynthesis
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speechRate;
    }
  }, [speechRate]);

  // Stop audio when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [activeTrackIndex]);

  const handlePlayAudio = () => {
    // If the track has a real audio URL (uploaded MP3/WAV/etc)
    if (currentTrack.audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = speechRate;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Audio playback error:", err);
            alert("Audıo fayldı pley etiwde qátelik júz berdi.");
          });
      }
      return;
    }

    // Fallback: SpeechSynthesis for text-only synthetic speech
    if (!("speechSynthesis" in window)) {
      alert("Brauzerıńızda Speech Synthesis tayanılmaydı.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentTrack.transcript);
    utterance.lang = "tr-TR";
    utterance.rate = speechRate;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleSaveCustomTrack = () => {
    if (!newTitle.trim()) {
      alert("Íltimas, audıo temasın kiritiń!");
      return;
    }

    let audioDataUrl: string | undefined = undefined;

    const processSave = (dataUrl?: string) => {
      const newTrack: ListeningTrack = {
        id: "custom_" + Date.now(),
        title: newTitle.trim(),
        level: newLevel,
        transcript: newTranscript.trim() || "Jeke júklengen audıo faylı.",
        audioUrl: dataUrl,
        isCustom: true,
        questions: newQuestions.map((nq, idx) => ({
          id: idx + 1,
          q: nq.q.trim() || `Soraw #${idx + 1}`,
          options: [nq.optA, nq.optB, nq.optC, nq.optD],
          correct: nq.correct,
          explanation: nq.exp.trim() || "Durıs juvap audıoda aytılǵan.",
        })),
      };

      const updatedCustom = [...customTracks, newTrack];
      setCustomTracks(updatedCustom);

      try {
        // Exclude huge base64 from localStorage if too large, or save cleanly
        localStorage.setItem(CUSTOM_TRACKS_STORAGE_KEY, JSON.stringify(updatedCustom));
      } catch (e) {
        console.warn("Storage warning:", e);
      }

      // Reset form
      setNewTitle("");
      setNewTranscript("");
      setAudioFile(null);
      setShowAddModal(false);
      setActiveTrackIndex(allTracks.length); // select the newly added track
      alert("✅ Jańa audıo hám sorawlar tabıslı qosıldı!");
    };

    if (audioFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        audioDataUrl = e.target?.result as string;
        processSave(audioDataUrl);
      };
      reader.readAsDataURL(audioFile);
    } else {
      processSave();
    }
  };

  const handleDeleteCustomTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Ushı audıo hám sorawlardı óshiriwdi qáleysizbe?")) {
      const filtered = customTracks.filter((t) => t.id !== id);
      setCustomTracks(filtered);
      localStorage.setItem(CUSTOM_TRACKS_STORAGE_KEY, JSON.stringify(filtered));
      setActiveTrackIndex(0);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HTML5 Audio Element for Real Audio File Playback */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Headphones className="w-4 h-4" />
              <span>Tıńlaw (Listening) Sınaw Bólimi</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Túrk Tili Tıńlaw (Listening) hám Jeke Audıolar
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              TÖMER & DTM dáreje audıoların tıńlań yaki ózińizdiń tayarlaǵan haqıyqıy dawıslı audıo fayllarıńızdı (MP3/WAV) júklep, olarǵa sorawlar qosıń!
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Jańa Audıo hám Soraw Qosıw</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TRACK SELECTOR & PLAYER */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Music className="w-4 h-4 text-cyan-400" />
                <span>Audıo Dialógtı Saylań:</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Jámı: {allTracks.length} audıo
              </span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {allTracks.map((tr, idx) => (
                <div
                  key={tr.id}
                  onClick={() => {
                    setActiveTrackIndex(idx);
                    setUserAnswers({});
                    setShowResults(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer text-xs sm:text-sm flex items-center justify-between gap-3 ${
                    activeTrackIndex === idx
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-200 font-bold shadow-md shadow-cyan-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    {tr.audioUrl ? (
                      <FileAudio className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate">{tr.title}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold border border-slate-700">
                      {tr.level}
                    </span>
                    {tr.isCustom && (
                      <button
                        onClick={(e) => handleDeleteCustomTrack(tr.id, e)}
                        title="Óshiriw"
                        className="p-1 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* AUDIO PLAYER CONTROLS */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mx-auto flex items-center justify-center text-cyan-400 shadow-inner">
                {currentTrack.audioUrl ? (
                  <FileAudio className={`w-8 h-8 ${isPlaying ? "animate-bounce text-emerald-400" : ""}`} />
                ) : (
                  <Volume2 className={`w-8 h-8 ${isPlaying ? "animate-pulse" : ""}`} />
                )}
              </div>

              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-cyan-400 font-semibold mb-1">
                  {currentTrack.audioUrl ? (
                    <>
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Haqıyqıy Dawıslı Audıo Fayl</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-cyan-400" />
                      <span>Avtomat Audıo Sintator</span>
                    </>
                  )}
                </div>
                <h4 className="font-bold text-white text-base">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Túrk tilinde tábiyiy aytılıw (Tezlik: {speechRate}x)
                </p>
              </div>

              {/* Progress bar for Real Audio File */}
              {currentTrack.audioUrl && duration > 0 && (
                <div className="space-y-1 pt-1 max-w-sm mx-auto">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = parseFloat(e.target.value);
                      setCurrentTime(newTime);
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                      }
                    }}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Speed Control Buttons */}
              <div className="flex justify-center gap-2 text-xs">
                {[0.75, 0.9, 1.0, 1.25].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`px-3 py-1 rounded-lg border transition cursor-pointer text-[11px] font-semibold ${
                      speechRate === rate
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {rate === 0.75 ? "Áste (0.75x)" : rate === 0.9 ? "O'rtasha (0.9x)" : rate === 1.0 ? "Tábiyiy (1.0x)" : "Tez (1.25x)"}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handlePlayAudio}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center space-x-2 text-sm"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>Audıonı Toqtatıw</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Audıonı Tıńlaw</span>
                    </>
                  )}
                </button>
              </div>

              {/* Show Transcript Toggle */}
              <div className="pt-2">
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
                >
                  {showTranscript ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Tekstti (Transcript) Jabıw</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Audıo Tekstin Kóriw</span>
                    </>
                  )}
                </button>

                {showTranscript && (
                  <div className="mt-3 p-4 bg-slate-900 rounded-xl border border-slate-800 text-left text-xs text-slate-300 font-serif leading-relaxed whitespace-pre-wrap animate-fade-in max-h-48 overflow-y-auto">
                    {currentTrack.transcript}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LISTENING QUIZ */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Tıńlaw Túsiniwi Sorawları</span>
              </h3>
              <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
                {currentTrack.questions.length} soraw
              </span>
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
              {currentTrack.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2.5 text-xs sm:text-sm bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <p className="font-bold text-slate-100 flex items-start space-x-2">
                    <span className="text-cyan-400">{idx + 1}.</span>
                    <span>{q.q}</span>
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[q.id] === optIdx;
                      const isCorrect = q.correct === optIdx;

                      let style =
                        "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80";

                      if (showResults) {
                        if (isCorrect) {
                          style =
                            "bg-emerald-950/80 border-emerald-500 text-emerald-100 font-bold";
                        } else if (isSelected && !isCorrect) {
                          style =
                            "bg-rose-950/80 border-rose-500 text-rose-100 line-through";
                        }
                      } else if (isSelected) {
                        style =
                          "bg-cyan-500/20 border-cyan-500 text-cyan-200 font-bold shadow-sm";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => {
                            if (!showResults) {
                              setUserAnswers((prev) => ({
                                ...prev,
                                [q.id]: optIdx,
                              }));
                            }
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition cursor-pointer text-xs ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <strong className="text-cyan-400">Túsindirme:</strong>{" "}
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!showResults ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={
                  Object.keys(userAnswers).length <
                  currentTrack.questions.length
                }
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl shadow transition cursor-pointer text-xs sm:text-sm"
              >
                Tıńlaw Juwapların Tekseriw
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowResults(false);
                  setUserAnswers({});
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 rounded-xl border border-slate-700 transition cursor-pointer text-xs sm:text-sm flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qaytadan Tıńlaw hám Sınaw</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: ADD CUSTOM AUDIO & QUESTIONS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Jańa Audıo Fayl hám Sorawlar Qosıw
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ózińizdiń haqıyqıy dawıslı audıo faylıńızdı (MP3, WAV) hám oǵan mos test sorawların kiritiń
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Audio Title & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Audıo Teması / Ataması *
                  </label>
                  <input
                    type="text"
                    placeholder="Maselen: TÖMER B1 Dinleme - Otelde Konuşma"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    CEFR Dárejesi
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="A1">A1 Dáreje</option>
                    <option value="A2">A2 Dáreje</option>
                    <option value="B1">B1 Dáreje</option>
                    <option value="B2">B2 Dáreje</option>
                    <option value="C1">C1 Dáreje</option>
                  </select>
                </div>
              </div>

              {/* Audio File Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Audıo Fayldı Saylań (.mp3, .wav, .m4a, .ogg)
                </label>
                <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 text-center bg-slate-950/60 transition">
                  <input
                    type="file"
                    accept="audio/*"
                    id="audio-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAudioFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <FileAudio className="w-8 h-8 text-cyan-400" />
                    <span className="text-xs text-slate-300 font-medium">
                      {audioFile ? `✅ Saylandı: ${audioFile.name}` : "Audıo fayldı júklew ushın usi jerge basıń"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      MP3, WAV, M4A dawıslı fayllar tayanıladı
                    </span>
                  </label>
                </div>
              </div>

              {/* Transcript Text (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Audıo Teksti / Transcript (Ixtıyarıy)
                </label>
                <textarea
                  rows={3}
                  placeholder="Audıodagı dialóg yaki tekst maǵlıwmatların jazıń..."
                  value={newTranscript}
                  onChange={(e) => setNewTranscript(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* QUESTIONS BUILDER */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                    Test Sorawların Qosıw ({newQuestions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setNewQuestions((prev) => [
                        ...prev,
                        {
                          q: `Soraw #${prev.length + 1}`,
                          optA: "A) ",
                          optB: "B) ",
                          optC: "C) ",
                          optD: "D) ",
                          correct: 0,
                          exp: "Túsindirme...",
                        },
                      ]);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yana Soraw Qosıw</span>
                  </button>
                </div>

                {newQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {qIdx + 1}-Soraw
                      </span>
                      {newQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewQuestions((prev) => prev.filter((_, i) => i !== qIdx));
                          }}
                          className="text-rose-400 hover:text-rose-300 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Soraw tekstin kiritiń..."
                      value={q.q}
                      onChange={(e) => {
                        const updated = [...newQuestions];
                        updated[qIdx].q = e.target.value;
                        setNewQuestions(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />

                    {/* 4 Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold">A Variant</span>
                        <input
                          type="text"
                          value={q.optA}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[qIdx].optA = e.target.value;
                            setNewQuestions(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold">B Variant</span>
                        <input
                          type="text"
                          value={q.optB}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[qIdx].optB = e.target.value;
                            setNewQuestions(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold">C Variant</span>
                        <input
                          type="text"
                          value={q.optC}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[qIdx].optC = e.target.value;
                            setNewQuestions(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold">D Variant</span>
                        <input
                          type="text"
                          value={q.optD}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[qIdx].optD = e.target.value;
                            setNewQuestions(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-semibold">Durıs Variant</span>
                        <select
                          value={q.correct}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[qIdx].correct = parseInt(e.target.value);
                            setNewQuestions(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                        >
                          <option value={0}>A Variant</option>
                          <option value={1}>B Variant</option>
                          <option value={2}>C Variant</option>
                          <option value={3}>D Variant</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold">Túsindirme / Izoh</span>
                        <input
                          type="text"
                          placeholder="Neden bu variant durıs?"
                          value={q.exp}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[qIdx].exp = e.target.value;
                            setNewQuestions(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-2 flex justify-end space-x-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Biykar Etiw
              </button>
              <button
                type="button"
                onClick={handleSaveCustomTrack}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 transition cursor-pointer"
              >
                Audıo hám Sorawlardı Saqlaw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

