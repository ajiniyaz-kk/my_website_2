import React, { useState } from "react";
import { ReadingMaterial } from "../types";
import {
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
} from "lucide-react";

export const ReadingPractice: React.FC = () => {
  const [level, setLevel] = useState<"A2" | "B1" | "B2" | "C1">("B2");
  const [category, setCategory] = useState("Kültür ve Eğitim");
  const [isLoading, setIsLoading] = useState(false);
  const [readingMaterial, setReadingMaterial] =
    useState<ReadingMaterial | null>({
      titleTurkish: "İstanbul Üniversiteleri ve Özbek Öğrenciler",
      titleKarakalpak: "Stambul Universitetleri hám Ózbekstanlı Studentler",
      passageTurkish:
        "Türkiye ve Özbekistan arasındaki köklü tarihi bağlar, son yıllarda eğitim alanındaki iş birliği ile daha da güçlenmiştir. Özellikle İstanbul, Ankara ve İzmir gibi büyük şehirlerdeki köklü üniversiteler, her yıl yüzlerce Özbekistanlı öğrenciye ev sahipliği yapmaktadır. Türkçenin Karakalpakça ve Özbekçe ile aynı dil ailesinden (Türk dilleri) gelmesi, öğrencilerin uyum sürecini oldukça hızlandırmaktadır. Üniversitelerde sunulan lisans ve yüksek lisans programları, genç araştırmacılara uluslararası standartlarda akademisyen olma imkânı sunar.",
      vocabularyNotes: [
        {
          turkishWord: "köklü",
          karakalpakMeaning: "Tamyrlı / Áyyemgi / Kúshli",
          explanation: "Geçmişi eskiye dayanan, güçlü temelleri olan.",
        },
        {
          turkishWord: "ev sahipliği yapmak",
          karakalpakMeaning: "Miymanxona bolıw / Qabıllaw",
          explanation: "Ağırlamak, misafir kabul etmek.",
        },
        {
          turkishWord: "uyum süreci",
          karakalpakMeaning: "Kónigiw / Úyrenisiw dáwiri",
          explanation: "Yeni bir ortama alışma zamanı.",
        },
      ],
      questions: [
        {
          id: 1,
          questionTurkish:
            "Metne göre, Özbekistanlı öğrencilerin Türkiye'deki uyum sürecini hızlandıran temel etken nedir?",
          questionKarakalpak:
            "Tekstke bola, ózbekstanlı studentlerdıń úyrenisiw dáwirin tezletetuǵın tiykarǵı sebep ne?",
          options: [
            "A) Şehirlerin büyüklüğü",
            "B) Türkçenin Türk dilleri ailesinden olması",
            "C) Üniversitelerin burs imkânları",
            "D) İstanbul'un iklimi",
          ],
          correctIndex: 1,
          explanationKarakalpak:
            "Tekstte 'Türkçenin Karakalpakça ve Özbekçe ile aynı dil ailesinden gelmesi, öğrencilerin uyum sürecini oldukça hızlandırmaktadır' dep kórsetilgen.",
        },
        {
          id: 2,
          questionTurkish:
            "Metinden çıkarılabilecek en doğru yargı aşağıdakilerden hangisidir?",
          questionKarakalpak:
            "Tekstten shıǵarılatuǵın eń durıs xulosa qaysı?",
          options: [
            "A) İki ülke arasındaki eğitim iş birliği giderek artmaktadır.",
            "B) Özbek öğrenciler sadece İstanbul'da okuyabilir.",
            "C) Türk dilleri arasında hiçbir benzerlik yoktur.",
            "D) Türkiye'de lisans eğitimi verilmemektedir.",
          ],
          correctIndex: 0,
          explanationKarakalpak:
            "Tekst eki mamleket arasaındaǵı ta'lim tarawındagı birge islesiw kúsheygenin atap ótedi.",
        },
      ],
    });

  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerateMaterial = async () => {
    setIsLoading(true);
    setShowResults(false);
    setUserAnswers({});

    try {
      const response = await fetch("/api/reading/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, category }),
      });

      const data = await response.json();
      setReadingMaterial(data);
    } catch (err) {
      console.error(err);
      alert("Mətin jaratıwda qátelik júz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qId: number, optionIndex: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <FileText className="w-4 h-4" />
              <span>Oqıw (Reading) Sınaw Bólimi</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Túrk Tili Oqıw (Reading) Mátinleri
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              CEFR A2-C1 dárrejesindegi Túrkce orijinal mətinler hám olar boyınsha test sorawların islep, sabaqlıq sózlerdi úyrenıń.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateMaterial}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Jańa Mətin Jaratıw (AI)</span>
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-4 items-center">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Dárreje (CEFR):</span>
            <div className="flex gap-1.5">
              {(["A2", "B1", "B2", "C1"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    level === l
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Kategoriya:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-none"
            >
              <option value="Kültür ve Eğitim">Kültür ve Eğitim</option>
              <option value="Teknoloji ve Bilim">Teknoloji ve Bilim</option>
              <option value="Tarih ve Gezi">Tarih ve Gezi</option>
              <option value="Toplum ve Ekonomi">Toplum ve Ekonomi</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-cyan-400 font-semibold">
            AI CEFR {level} dárrejesindegi original Mətin hám test sorawların jaratıp atır...
          </p>
        </div>
      ) : readingMaterial ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* READING PASSAGE */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block">
                  CEFR {level} Reading Passage
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {readingMaterial.titleTurkish}
                </h3>
                <h4 className="text-xs text-slate-400 italic">
                  ({readingMaterial.titleKarakalpak})
                </h4>
              </div>

              <div className="text-slate-200 text-sm leading-relaxed bg-slate-950 p-5 rounded-xl border border-slate-800 font-serif whitespace-pre-wrap">
                {readingMaterial.passageTurkish}
              </div>

              {/* VOCABULARY NOTES */}
              {readingMaterial.vocabularyNotes &&
                readingMaterial.vocabularyNotes.length > 0 && (
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Mətindegi Tiykarǵı
                      Sózler (Qaraqalpaqsha Awdarması):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {readingMaterial.vocabularyNotes.map((v, i) => (
                        <div
                          key={i}
                          className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"
                        >
                          <span className="font-bold text-cyan-300">
                            {v.turkishWord}
                          </span>{" "}
                          →{" "}
                          <span className="text-slate-200">
                            {v.karakalpakMeaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* COMPREHENSION QUESTIONS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Tekst Boyınsha Test Sorawları
              </h3>

              <div className="space-y-6">
                {readingMaterial.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-2 text-xs sm:text-sm">
                    <p className="font-bold text-slate-100">
                      {idx + 1}. {q.questionTurkish}
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      ({q.questionKarakalpak})
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[q.id] === optIdx;
                        const isCorrectOpt = q.correctIndex === optIdx;

                        let style =
                          "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800";

                        if (showResults) {
                          if (isCorrectOpt) {
                            style =
                              "bg-emerald-950/80 border-emerald-500 text-emerald-100 font-bold";
                          } else if (isSelected && !isCorrectOpt) {
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
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border transition cursor-pointer text-xs ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <strong className="text-cyan-400">Túsindirme:</strong>{" "}
                        {q.explanationKarakalpak}
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
                    readingMaterial.questions.length
                  }
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl shadow transition cursor-pointer text-xs sm:text-sm"
                >
                  Test Juwapların Tekseriw
                </button>
              ) : (
                <button
                  onClick={handleGenerateMaterial}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 rounded-xl border border-slate-700 transition cursor-pointer text-xs sm:text-sm"
                >
                  Kelesi Mətinge Ótiw
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
