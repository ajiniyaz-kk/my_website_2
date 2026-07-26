import React, { useState } from "react";
import { WritingEvaluation } from "../types";
import {
  PenTool,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export const WritingEvaluator: React.FC = () => {
  const writingTasks = [
    {
      id: "w1",
      title: "1-Tapsırma: Universitet Dekanına Rásmiy Xat (Formal Letter)",
      prompt:
        "Türkiye'de bir üniversitede eğitim almaktasınız. Ders kaydı sırasında yaşadığınız teknik bir sorundan dolayı dekanlığa resmi bir dilekçe/mektup yazınız. Sorunu ve çözüm talebinizi açıklayınız. (En az 150 kelime).",
      level: "B1-B2",
    },
    {
      id: "w2",
      title: "2-Tapsırma: İjtimoiy Tarmaqlar hám Jaslar (Insho / Essay)",
      prompt:
        "Sosyal medyanın gençlerin eğitimi ve sosyal hayatı üzerindeki olumlu ve olumsuz etkilerini tartışan bir kompozisyon (essay) yazınız. Kendi görüşlerinizi örneklerle destekleyiniz. (En az 200 kelime).",
      level: "B2-C1",
    },
    {
      id: "w3",
      title: "3-Tapsırma: Ekologiya hám Atırap-Aylıq (Insho / Essay)",
      prompt:
        "İklim değişikliği ve çevre kirliliği günümüzün en büyük sorunlarındandır. Bireylerin ve devletlerin bu konuda alması gereken önlemleri açıklayan analitik bir yazı yazınız. (En az 200 kelime).",
      level: "B2-C1",
    },
  ];

  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [essayText, setEssayText] = useState("");
  const [cefrLevel, setCefrLevel] = useState<"B1" | "B2" | "C1">("B2");
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);

  const currentTask = writingTasks[selectedTaskIndex];

  const countWords = (str: string) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  const handleEvaluate = async () => {
    if (!essayText.trim() || countWords(essayText) < 10) {
      alert("Iltimas, azyında 15-20 sózden ibarat gápler jazıń.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: currentTask.title,
          taskPrompt: currentTask.prompt,
          userEssay: essayText,
          cefrLevel,
        }),
      });

      const data = await response.json();
      setEvaluation(data);
    } catch (err) {
      console.error(err);
      alert("Jazıwdı bahalawda qátelik júz berdi. Qaytadan urinip kóriń.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <PenTool className="w-4 h-4" />
              <span>Jazıw (Writing) 30 Ballıq Rubrik Sınawı</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Túrk Tili Insho (Writing) AI Bahalawshı
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Ózbekstan Shet tillerin biliw sertifikatı rásmiy 30 ballıq bahalaw
              kriteriyaları (Görev Tamamlama, Bütünlük, Kelime Bilgisi, Dilbilgisi) boyınsha inshońızdı AI arqalı tekserıń.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TASK PROMPT & EDITOR */}
        <div className="lg:col-span-7 space-y-4">
          {/* TASK SELECTOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <label className="text-xs text-slate-400 font-semibold block">
              Tapsırma Temasın Saylań:
            </label>
            <div className="space-y-2">
              {writingTasks.map((task, idx) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskIndex(idx);
                    setEvaluation(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer text-xs sm:text-sm ${
                    selectedTaskIndex === idx
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-200 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{task.title}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {task.level}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Task Details */}
            <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase">
                Tapsırma Mazmunı (Sınaw Shárti):
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentTask.prompt}
              </p>
            </div>
          </div>

          {/* ESSAY TEXTAREA */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                Inshońızdı Túrk tilinde jazıń:
              </span>
              <span>
                Sózler sanı:{" "}
                <strong className="text-cyan-400">
                  {countWords(essayText)}
                </strong>{" "}
                sóz
              </span>
            </div>

            <textarea
              rows={8}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }, 150);
              }}
              placeholder="Türkçe kompozisyonunuzu buraya yazınız..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-slate-200 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-cyan-500 transition resize-none font-sans min-h-[160px] sm:min-h-[220px]"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setEssayText("");
                  setEvaluation(null);
                }}
                className="text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tekstti Tazalaw</span>
              </button>

              <button
                onClick={handleEvaluate}
                disabled={!essayText.trim() || isLoading}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>30 Ballıq Rubrik Bahalanatır...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Inshonı AI Bahalaw</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EVALUATION REPORT */}
        <div className="lg:col-span-5 space-y-4">
          {evaluation ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in">
              {/* Score Badge Header */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Jámı Baha Score (Max 30)
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-cyan-400">
                      {evaluation.totalScore}
                    </span>
                    <span className="text-slate-400 text-sm font-bold">
                      / 30
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Boǵalanǵan CEFR Band
                  </span>
                  <span className="inline-block mt-0.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm rounded-lg shadow">
                    {evaluation.CEFRBand}
                  </span>
                </div>
              </div>

              {/* Rubric Breakdown Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">
                    Görev Tamamlama:
                  </span>
                  <strong className="text-emerald-400 font-bold">
                    {evaluation.taskFulfillmentScore} / 7.5
                  </strong>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">
                    Bütünlük & Bağdaşıklık:
                  </span>
                  <strong className="text-blue-400 font-bold">
                    {evaluation.coherenceScore} / 7.5
                  </strong>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">
                    Kelime Zenginliği:
                  </span>
                  <strong className="text-purple-400 font-bold">
                    {evaluation.vocabularyScore} / 7.5
                  </strong>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">
                    Dilbilgisi & Doğruluk:
                  </span>
                  <strong className="text-amber-400 font-bold">
                    {evaluation.grammarScore} / 7.5
                  </strong>
                </div>
              </div>

              {/* Feedback In Karakalpak */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Ulıwma Xulosa (Qaraqalpaqsha):
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  {evaluation.generalFeedbackKarakalpak}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="space-y-2 text-xs">
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Kúshli tárepleri:
                  </span>
                  <ul className="list-disc list-inside text-emerald-200 space-y-0.5">
                    {evaluation.strengthsKarakalpak?.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Islesiw kerek bolǵan kemshilikler:
                  </span>
                  <ul className="list-disc list-inside text-rose-200 space-y-0.5">
                    {evaluation.weaknessesKarakalpak?.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Corrected Ideal Essay */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Ideal Óńlengen Túrkce Nusqası:
                </h4>
                <div className="text-xs text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed max-h-52 overflow-y-auto font-serif italic">
                  "{evaluation.correctedEssayTurkish}"
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3 min-h-[400px] flex flex-col items-center justify-center">
              <Award className="w-12 h-12 text-slate-700" />
              <h3 className="text-base font-bold text-slate-300">
                Inshońızdı AI Bahalawǵa Tayar
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Inshońızdı sol táreptegi maydanǵa jazıń hám 'Inshonı AI Bahalaw' túymesin basıń.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
