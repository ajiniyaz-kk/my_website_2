import React, { useState } from "react";
import { NewsItem } from "../types";
import {
  Newspaper,
  Sparkles,
  BookOpen,
  Volume2,
  Calendar,
  User,
  Clock,
  Printer,
  FileText,
  Send,
  PlusCircle,
  ExternalLink,
  Tag,
  CheckCircle,
  ArrowRight,
  Download,
} from "lucide-react";

export const NewsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [loadingTranslation, setLoadingTranslation] = useState<string | null>(null);

  // Preloaded rich news articles
  const [newsList, setNewsList] = useState<NewsItem[]>([
    {
      id: "news-1",
      titleKarakalpak: "2026-jılǵı TÖMER hám DTM Sınawlarındaǵı Eń Baslı Jańalıqlar",
      titleTurkish: "2026 TÖMER ve DTM Türkçe Sertifika Sınavı Güncellemeleri",
      category: "Exam",
      date: "26-İyul, 2026",
      summaryKarakalpak:
        "Ózbekstanda DTM tarafınan ótkeriletuǵın Túrk tili sertifikat sınavında awızsha (Speaking) hám jazıw (Writing) bólimlerine túsatuǵın tapsırmalar forması jańalandı.",
      contentTurkish:
        "Türkiye Türkçesi Yeterlilik Sınavı (TÖMER ve DTM) standartlarında yeni güncelleme yapıldı. B2 ve C1 seviyelerinde adayların Konuşma (Speaking) bölümünde gerçek hayat senaryoları ve interaktif mülakat sorularına yanıt vermeleri beklenmektedir. Yazma (Writing) bölümünde ise 30 puanlık değerlendirme kriterleri: Görev Tamamlama, Bağdaşıklık, Kelime Zenginliği ve Gramer Doğruluğudur.",
      contentKarakalpak:
        "Túrk tili sertifikat sınavı (TÖMER hám DTM) standartlarında jańa ózgerisler kiritildi. B2 hám C1 dárrejelerinde imtihan tapsırıwshılardıń Awızsha (Speaking) bóliminde haqıyqıy turmıslıq jagdaylar hám interaktiv mülakat sorawlarına juwap beriwleri kútiledi. Jazıw (Writing) bóliminde bolsa 30 ballıq bahalaw kriteriyaları: Tapsırmanı orınlaw, Bütünlik, Sóz baylıǵı hám Grammatika durıslıǵı esaplanadı.",
      author: "DTM Sertifikat Redaktsiyası",
      readTimeMinutes: 3,
      featuredWord: {
        turkish: "Yeterlilik",
        karakalpak: "Kónlikpe / Uqıp / Usul",
        example: "Türkçe Yeterlilik Sınavı sonuçları açıklandı.",
      },
    },
    {
      id: "news-2",
      titleKarakalpak: "Túrk Tilindegi Eń Kóp Qullanılatuǵın 50 Idiomatik Ańlatpa",
      titleTurkish: "Türkçede En Çok Kullanılan Deyimler ve Anlamları",
      category: "Vocabulary",
      date: "24-İyul, 2026",
      summaryKarakalpak:
        "Gúnlik turmısta hám film/seraillardaw eń kóp esitiletuǵın túrkce frazeologizmler hám olardıń qaraqalpaqsha ma'nisin úyrenıń.",
      contentTurkish:
        "Türkçe konuşurken doğal görünmenin sırrı deyimleri doğru kullanmaktır. Örneğin 'Göz kulak olmak' deyimi birine veya bir şeye dikkatle bakmak, korumak anlamına gelir. 'Eline sağlık' deyimi ise yapılan bir yemek veya iş için teşekkür bildirmek amacıyla kullanılır.",
      contentKarakalpak:
        "Túrk tilinde tábiyiy hám erkin sóylesiwdiń tiykarǵı sırrı deyimlerdi (frazeologizmlerdi) durıs qullanıwda. Mısalı 'Göz kulak olmak' ańlatpası birewge yaki bir nársege dıqqat penen qaraw, qorǵaw mánisin bildiredi. 'Eline sağlık' bolsa tayarlanǵan awqat yaki is ushın minnetdorshılıq bildiriw ushın qullanıladı.",
      author: "Aylin AI Mugallim",
      readTimeMinutes: 4,
      featuredWord: {
        turkish: "Göz kulak olmak",
        karakalpak: "Kóz-qulaq bolıw / Qaraqlap júriw",
        example: "Çocuklara parkta göz kulak olmalısın.",
      },
    },
    {
      id: "news-3",
      titleKarakalpak: "İstanbul Universiteti B2 Grammatika Konspekti: Eń Zıúr Qaıdalar",
      titleTurkish: "İstanbul Üniversitesi B2 Dilbilgisi Özet Notları",
      category: "Grammar",
      date: "20-İyul, 2026",
      summaryKarakalpak:
        "Fiilimsi (Esimlik, Rawaishlik) hám Zarflar temaların ańsat úyreniw ushın arnalǵan ápiwayı konspekt jıynagı.",
      contentTurkish:
        "B2 seviyesinde Türkçe öğrenenlerin en çok zorlandığı konular zarf-fiiller (ip, erek, dikçe, inca) ve bağlaçlardır. Bu ekler cümleleri birbirine bağlayarak daha akıcı ve kompleks yapılar kurmanızı sağlar. Örneğin: 'Okula gidip kütüphaneye uğradım' cümlesindeki '-ip' eki zaman sırasını gösterir.",
      contentKarakalpak:
        "B2 dárrejesinde túrk tilin úyreniwshiler eń kóp qıynalatuǵın temalar zarf-fiiller (-ip, -erek, -dikçe, -inca) hám dánekerlerdir. Bul qosımshalar gáplerdi bir-birine baylanıstırıp, erkin hám shabdossha sóylewge imkaniyat beredi.",
      author: "Grammatika Metodistleri",
      readTimeMinutes: 5,
      featuredWord: {
        turkish: "Fiilimsi",
        karakalpak: "Esimfeillik / Rawaishlik",
        example: "Ders çalışarak sınavı kazandı.",
      },
    },
  ]);

  // Handle Text-To-Speech for articles
  const handleSpeakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Generate new article via Gemini
  const handleGenerateCustomNews = async () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/news/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicPrompt: customPrompt,
          category: "Exam",
        }),
      });

      const data = await response.json();
      const newArticle: NewsItem = {
        id: `news-${Date.now()}`,
        titleKarakalpak: data.titleKarakalpak || customPrompt,
        titleTurkish: data.titleTurkish || customPrompt,
        category: (data.category as any) || "Exam",
        date: "Búgin",
        summaryKarakalpak: data.summaryKarakalpak || "",
        contentTurkish: data.contentTurkish || "",
        contentKarakalpak: data.contentKarakalpak || "",
        author: data.author || "AI Redaktsiyası",
        readTimeMinutes: data.readTimeMinutes || 3,
        featuredWord: data.featuredWord,
      };

      setNewsList((prev) => [newArticle, ...prev]);
      setSelectedArticle(newArticle);
      setCustomPrompt("");
    } catch (err) {
      console.error(err);
      alert("Maqala jaratıwda qátelik júz berdi.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick translate helper
  const handleTranslateSentence = async (text: string, id: string) => {
    if (translations[id]) return;
    setLoadingTranslation(id);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textTurkish: text }),
      });
      const data = await res.json();
      setTranslations((prev) => ({
        ...prev,
        [id]: data.translationKarakalpak || "Awdarma tayarlandı.",
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTranslation(null);
    }
  };

  const filteredNews =
    activeCategory === "ALL"
      ? newsList
      : newsList.filter((n) => n.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Newspaper className="w-4 h-4" />
              <span>Jańalıqlar hám Resurslar Portalı</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Túrk Tili Jańalıqları hám Materiallar
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              DTM/TÖMER sınav jańalıqları, gúnlik sózlikler, grammatika konspektleri hám baspa tayar PDF materiallar jıynaǵı.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>PDF Konspektler & Cheatsheets</span>
            </button>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: "Barlıq Maqalalar" },
            { id: "Exam", label: "Sınaw Jańalıqları (DTM/TÖMER)" },
            { id: "Grammar", label: "Grammatika Qaıdaları" },
            { id: "Vocabulary", label: "Sózlik hám Deyimler" },
            { id: "Culture", label: "Mádaniyat hám Turmıs" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED WORD OF THE DAY BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Gúnlik Zıúr Sóz (Word of the Day)</span>
          </div>
          <div className="flex items-baseline space-x-3">
            <h3 className="text-2xl font-black text-white">Yeterlilik</h3>
            <span className="text-slate-400 text-sm italic">
              → Kónlikpe / Uqıp / Usul
            </span>
          </div>
          <p className="text-xs text-indigo-200">
            Mısal: "Türkçe Yeterlilik Sınavı sonuçları açıklandı." (Túrk tili kónlikpe sınavı nátiyjeleri e'lon etildi)
          </p>
        </div>

        <button
          onClick={() =>
            handleSpeakText("Yeterlilik. Türkçe Yeterlilik Sınavı sonuçları açıklandı.")
          }
          className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-2 transition cursor-pointer shrink-0"
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>Daus penen Tıńlaw</span>
        </button>
      </div>

      {/* GENERATE CUSTOM ARTICLE WITH AI */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <PlusCircle className="w-4 h-4" />
          <span>AI Redaktsiyasınan Jańa Maqala Tostaw</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Maqala teması: Mısalı, 'Túrk tilinde A2-B1 gáplerdi durıs duziw usulları'..."
            className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleGenerateCustomNews}
            disabled={!customPrompt.trim() || isGenerating}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 shrink-0"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Jaratılmaqta...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Maqala Jaratıw</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ARTICLES GRID & READER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT LIST */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider px-1">
            Sońǵı Jańalıqlar hám Maqalalar ({filteredNews.length})
          </h3>

          <div className="space-y-3">
            {filteredNews.map((item) => {
              const isSelected = selectedArticle?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedArticle(item)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-slate-800 border-cyan-500/80 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
                      {item.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm sm:text-base leading-snug">
                    {item.titleKarakalpak}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.summaryKarakalpak}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                    <span className="flex items-center gap-1 text-slate-300">
                      <User className="w-3 h-3 text-cyan-400" /> {item.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.readTimeMinutes} min
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT DETAILS / READER */}
        <div className="lg:col-span-7">
          {selectedArticle ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-20">
              <div className="space-y-3 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg text-xs font-bold">
                    {selectedArticle.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSpeakText(selectedArticle.contentTurkish)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition cursor-pointer flex items-center space-x-1 text-xs"
                      title="Audıosın tıńlaw"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Audıo (tr-TR)</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedArticle.titleKarakalpak}
                </h3>
                <h4 className="text-xs text-cyan-400 font-semibold italic">
                  Túrksha: {selectedArticle.titleTurkish}
                </h4>

                <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                  <span>Redaktor: {selectedArticle.author}</span>
                  <span>•</span>
                  <span>Sene: {selectedArticle.date}</span>
                </div>
              </div>

              {/* ARTICLE TURKISH TEXT */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-cyan-400" /> Túrkce Tekst
                  (Original):
                </h5>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-100 text-sm sm:text-base font-serif leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.contentTurkish}
                </div>
              </div>

              {/* ARTICLE KARAKALPAK TRANSLATION */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Qaraqalpaqsha
                  Mazmunı hám Túsindirmesi:
                </h5>
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.contentKarakalpak}
                </div>
              </div>

              {/* FEATURED WORD CARD */}
              {selectedArticle.featuredWord && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-1.5 text-xs">
                  <span className="font-bold text-amber-400 block uppercase tracking-wider">
                    📌 Maqaladaǵı Tiykarǵı Sóz:
                  </span>
                  <p className="text-sm font-bold text-white">
                    {selectedArticle.featuredWord.turkish}{" "}
                    <span className="text-slate-400 font-normal">
                      → {selectedArticle.featuredWord.karakalpak}
                    </span>
                  </p>
                  <p className="text-slate-300 italic">
                    "{selectedArticle.featuredWord.example}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Newspaper className="w-12 h-12 text-cyan-500 mx-auto opacity-50" />
              <p className="text-sm font-semibold text-slate-300">
                Oqıw ushın sol táptagı maqalalardan birin saylań
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PDF & KONSPEKT MODAL */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-slate-100">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Túrk Tili B1/B2 Konspekt hám Sınaw Cheatsheet (PDF)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Barlıq grammatika hám zıúr sózler jıynaǵı
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPdfModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs sm:text-sm space-y-4 font-mono leading-relaxed text-slate-200">
              <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-1 text-sm">
                1. TÚRK TİLİ B1/B2 GRAMMATİKA ZIÚR QAIDALAR (SUMMARY):
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                <li>
                  <strong className="text-white">-ip / -ıp / -up / -üp:</strong> Eki feildi bir-birine tez izbe-izlikte baylanıstırıw (Gidip geldi = Barıp keldi).
                </li>
                <li>
                  <strong className="text-white">-erek / -arak:</strong> Is-harekettiń qalay orınlanǵanın kórsetiw (Gülerek söyledi = Kúlip ayttı).
                </li>
                <li>
                  <strong className="text-white">-dikçe / -dıkça:</strong> Harekettiń dawamlılıǵı hám shárti (Okudukça anladım = Oqıǵan sayın túsendim).
                </li>
                <li>
                  <strong className="text-white">-ebilmek / -abilmek:</strong> Imkaniyat hám uqıptı bildiriw (Yapabilirim = Isley alaman).
                </li>
              </ul>

              <h4 className="font-bold text-cyan-400 border-b border-slate-800 pb-1 text-sm pt-2">
                2. DTM SİNAVININ' BIKIR DIQQAT EDILETUĞIN 30 BALLIĞI:
              </h4>
              <p className="text-slate-300">
                • Writing bóliminde insho keminde 150 sóz bolıwı shart.<br />
                • Speaking bóliminde soraw berilgende dárrov 2-3 gáplik tolıq juwap beriń, "Evet/Hayır" dep toqtap qalmań.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Baspadan Shıǵarıw (Print / Save as PDF)</span>
              </button>

              <button
                onClick={() => setShowPdfModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Jabıw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
