import React, { useState } from "react";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

export const ListeningPractice: React.FC = () => {
  const listeningTracks = [
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

  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.85); // slightly slower for clarity
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const currentTrack = listeningTracks[activeTrackIndex];

  const handlePlayAudio = () => {
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Headphones className="w-4 h-4" />
              <span>Tıńlaw (Listening) Sınaw Bólimi</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Túrk Tili Tıńlaw (Listening) Sınawları
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Audıo dialóglardı tıńlań hám tushınıp alıw dárrejeńizdi test sorawları arqalı tekserıń.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TRACK SELECTOR & PLAYER */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white">Audıo Dialógtı Saylań:</h3>

            <div className="space-y-2">
              {listeningTracks.map((tr, idx) => (
                <button
                  key={tr.id}
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setIsPlaying(false);
                    setActiveTrackIndex(idx);
                    setUserAnswers({});
                    setShowResults(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer text-xs sm:text-sm ${
                    activeTrackIndex === idx
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-200 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tr.title}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {tr.level}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* AUDIO PLAYER CONTROLS */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mx-auto flex items-center justify-center text-cyan-400">
                <Volume2 className={`w-8 h-8 ${isPlaying ? "animate-pulse" : ""}`} />
              </div>

              <div>
                <h4 className="font-bold text-white text-base">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Túrk tilinde tábiyiy aytılıw (Speech Rate: {speechRate}x)
                </p>
              </div>

              {/* Speed Buttons */}
              <div className="flex justify-center gap-2 text-xs">
                <button
                  onClick={() => setSpeechRate(0.75)}
                  className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                    speechRate === 0.75
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Áste (0.75x)
                </button>
                <button
                  onClick={() => setSpeechRate(0.9)}
                  className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                    speechRate === 0.9
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  O'rtasha (0.9x)
                </button>
                <button
                  onClick={() => setSpeechRate(1.0)}
                  className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                    speechRate === 1.0
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Tábiyiy (1.0x)
                </button>
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
                  <div className="mt-3 p-4 bg-slate-900 rounded-xl border border-slate-800 text-left text-xs text-slate-300 font-serif leading-relaxed whitespace-pre-wrap animate-fade-in">
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
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Tıńlaw Túsiniwi Sorawları
            </h3>

            <div className="space-y-5">
              {currentTrack.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2 text-xs sm:text-sm">
                  <p className="font-bold text-slate-100">
                    {idx + 1}. {q.q}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[q.id] === optIdx;
                      const isCorrect = q.correct === optIdx;

                      let style =
                        "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800";

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
                          "bg-cyan-500/20 border-cyan-500 text-cyan-200 font-bold";
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
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
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
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl shadow transition cursor-pointer text-xs sm:text-sm"
              >
                Tıńlaw Juwapların Tekseriw
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowResults(false);
                  setUserAnswers({});
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl border border-slate-700 transition cursor-pointer text-xs sm:text-sm"
              >
                Qaytadan Tıńlaw hám Sınaw
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
