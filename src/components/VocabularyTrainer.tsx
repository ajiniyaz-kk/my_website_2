import React, { useState } from "react";
import { VocabularyUnit, WordItem, QuizResultItem } from "../types";
import { BUILT_IN_UNITS } from "../data/unitsData";
import {
  BookOpen,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  Upload,
  FileText,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Mic,
  Award,
  Layers,
  Search,
  Eye,
  EyeOff,
  List,
  CreditCard,
  Check,
} from "lucide-react";

interface VocabularyTrainerProps {
  onQuizCompleted: (
    scorePercent: number,
    wordsTestedCount: number,
    correctCount?: number,
    unitId?: string,
    correctWordIds?: string[]
  ) => void;
}

export const VocabularyTrainer: React.FC<VocabularyTrainerProps> = ({
  onQuizCompleted,
}) => {
  const [units, setUnits] = useState<VocabularyUnit[]>(BUILT_IN_UNITS);
  const [selectedUnit, setSelectedUnit] = useState<VocabularyUnit | null>(
    BUILT_IN_UNITS[0]
  );
  const [mode, setMode] = useState<"unit_select" | "flashcards" | "quiz">(
    "unit_select"
  );

  // Flashcards & List Study state
  const [studyViewMode, setStudyViewMode] = useState<"list" | "flashcard">("list");
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [hideTranslations, setHideTranslations] = useState(false);
  const [revealedWordIds, setRevealedWordIds] = useState<Record<string, boolean>>({});
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [activeQuizWords, setActiveQuizWords] = useState<WordItem[]>([]);
  const [quizWordIndex, setQuizWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoadingCheck, setIsLoadingCheck] = useState(false);
  const [currentCheckResult, setCurrentCheckResult] =
    useState<QuizResultItem | null>(null);
  const [quizResultsHistory, setQuizResultsHistory] = useState<
    QuizResultItem[]
  >([]);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Range Selection Modal state
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [rangeUnit, setRangeUnit] = useState<VocabularyUnit | null>(null);
  const [rangeStartInput, setRangeStartInput] = useState<number>(1);
  const [rangeEndInput, setRangeEndInput] = useState<number>(50);

  // Custom File / Text Modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customText, setCustomText] = useState("");
  const [isParsingCustom, setIsParsingCustom] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);

  // TTS audio playback
  const speakTurkishText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "tr-TR"; // Turkish voice
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech to Text input handling
  const startSpeechToText = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Brazuzerıńızda daus penen engiziw qollanılmaydı (Speech Recognition missing).");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR"; // Expect Turkish pronunciation
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer(transcript);
    };

    recognition.start();
  };

  // Open Range Selection Modal before starting Quiz
  const openRangeModal = (unit: VocabularyUnit) => {
    setRangeUnit(unit);
    setRangeStartInput(1);
    setRangeEndInput(Math.min(50, unit.words.length));
    setShowRangeModal(true);
  };

  // Confirm Range & Launch Quiz
  const handleConfirmRangeStart = (start: number, end: number) => {
    if (!rangeUnit) return;
    const safeStart = Math.max(1, Math.min(start, rangeUnit.words.length));
    const safeEnd = Math.max(safeStart, Math.min(end, rangeUnit.words.length));
    
    const wordsToTest = rangeUnit.words.slice(safeStart - 1, safeEnd);
    setSelectedUnit(rangeUnit);
    setActiveQuizWords(wordsToTest);
    setQuizWordIndex(0);
    setUserAnswer("");
    setCurrentCheckResult(null);
    setQuizResultsHistory([]);
    setIsQuizFinished(false);
    setShowRangeModal(false);
    setMode("quiz");
  };

  // Direct Start (Fallback or Retest)
  const handleStartQuizWithWords = (unit: VocabularyUnit, customWordsList?: WordItem[]) => {
    const list = customWordsList || unit.words;
    setSelectedUnit(unit);
    setActiveQuizWords(list);
    setQuizWordIndex(0);
    setUserAnswer("");
    setCurrentCheckResult(null);
    setQuizResultsHistory([]);
    setIsQuizFinished(false);
    setMode("quiz");
  };

  // Submit Answer for Current Word
  const handleCheckAnswer = async () => {
    const wordsList = activeQuizWords.length > 0 ? activeQuizWords : (selectedUnit?.words || []);
    if (!selectedUnit || wordsList.length === 0 || !userAnswer.trim()) return;

    const currentWord = wordsList[quizWordIndex];
    setIsLoadingCheck(true);

    try {
      const response = await fetch("/api/vocabulary/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          karakalpakWord: currentWord.karakalpak,
          userTurkishAnswer: userAnswer,
          unitContext: selectedUnit.titleKarakalpak,
        }),
      });

      const data = await response.json();

      const resultItem: QuizResultItem = {
        wordId: currentWord.id,
        karakalpakWord: currentWord.karakalpak,
        correctTurkish: data.correctTurkish || currentWord.turkish,
        userAnswer: userAnswer,
        isCorrect: data.isCorrect,
        isSkipped: false,
        partOfSpeech: currentWord.partOfSpeech || "Sóz",
        score: data.accuracyScore || (data.isCorrect ? 100 : 0),
        explanationKarakalpak:
          data.explanationKarakalpak ||
          (data.isCorrect
            ? "Durıs awdarma!"
            : `Durıs awdarma: ${currentWord.turkish}`),
        exampleSentenceTurkish: data.exampleSentenceTurkish,
        exampleSentenceKarakalpak: data.exampleSentenceKarakalpak,
      };

      setCurrentCheckResult(resultItem);
      setQuizResultsHistory((prev) => [...prev, resultItem]);

      // Speak correct Turkish
      speakTurkishText(resultItem.correctTurkish);
    } catch (err) {
      console.error(err);
      // Fallback local check
      const isExact =
        userAnswer.trim().toLowerCase() ===
        currentWord.turkish.trim().toLowerCase();
      const fallbackResult: QuizResultItem = {
        wordId: currentWord.id,
        karakalpakWord: currentWord.karakalpak,
        correctTurkish: currentWord.turkish,
        userAnswer: userAnswer,
        isCorrect: isExact,
        isSkipped: false,
        partOfSpeech: currentWord.partOfSpeech || "Sóz",
        score: isExact ? 100 : 0,
        explanationKarakalpak: isExact
          ? "Durıs juwap!"
          : `Túrk tilindegi durıs nusqası: ${currentWord.turkish}`,
        exampleSentenceTurkish: currentWord.exampleTurkish,
        exampleSentenceKarakalpak: currentWord.exampleKarakalpak,
      };
      setCurrentCheckResult(fallbackResult);
      setQuizResultsHistory((prev) => [...prev, fallbackResult]);
    } finally {
      setIsLoadingCheck(false);
    }
  };

  // Skip Current Word ("Bilmeymen / Kelesisine Ótiw")
  const handleSkipWord = () => {
    const wordsList = activeQuizWords.length > 0 ? activeQuizWords : (selectedUnit?.words || []);
    if (!selectedUnit || wordsList.length === 0) return;

    const currentWord = wordsList[quizWordIndex];

    const skipResult: QuizResultItem = {
      wordId: currentWord.id,
      karakalpakWord: currentWord.karakalpak,
      correctTurkish: currentWord.turkish,
      userAnswer: "Ótkizip jiberildi (Bilmeymen)",
      isCorrect: false,
      isSkipped: true,
      partOfSpeech: currentWord.partOfSpeech || "Sóz",
      score: 0,
      explanationKarakalpak: `Siz bul sózdı bilmey ótkizip jiberdińiz. Durıs awdarma: "${currentWord.turkish}"`,
      exampleSentenceTurkish: currentWord.exampleTurkish,
      exampleSentenceKarakalpak: currentWord.exampleKarakalpak,
    };

    setCurrentCheckResult(skipResult);
    setQuizResultsHistory((prev) => [...prev, skipResult]);
    speakTurkishText(currentWord.turkish);
  };

  // Move to Next Quiz Word
  const handleNextWord = () => {
    const wordsList = activeQuizWords.length > 0 ? activeQuizWords : (selectedUnit?.words || []);
    if (!selectedUnit || wordsList.length === 0) return;

    setUserAnswer("");
    setCurrentCheckResult(null);

    if (quizWordIndex + 1 < wordsList.length) {
      setQuizWordIndex((prev) => prev + 1);
    } else {
      // Quiz completed!
      setIsQuizFinished(true);
      const correctResults = quizResultsHistory.filter((r) => r.isCorrect);
      const correctCount = correctResults.length;
      const totalWords = wordsList.length;
      const percent = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
      const correctWordIds = correctResults.map((r) => r.wordId);

      onQuizCompleted(
        percent,
        totalWords,
        correctCount,
        selectedUnit.id,
        correctWordIds
      );
    }
  };

  // Retest Missed / Skipped Words
  const handleRetestMissed = () => {
    if (!selectedUnit) return;
    const missedWordIds = new Set(
      quizResultsHistory.filter((r) => !r.isCorrect).map((r) => r.wordId)
    );

    const missedWords = selectedUnit.words.filter((w) => missedWordIds.has(w.id));
    if (missedWords.length > 0) {
      handleStartQuizWithWords(selectedUnit, missedWords);
    }
  };

  // Parse Custom File or Text
  const handleParseCustomText = async () => {
    if (!customText.trim()) return;
    setIsParsingCustom(true);

    try {
      const response = await fetch("/api/vocabulary/parse-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customContent: customText }),
      });

      const data = await response.json();

      if (data.words && data.words.length > 0) {
        const newUnit: VocabularyUnit = {
          id: `custom-${Date.now()}`,
          unitNumber: units.length + 1,
          titleKarakalpak: data.unitTitle || "Oqıw Kursı Faylınan Sózlik",
          titleTurkish: "Özel Ders Dosyası Sözlüğü",
          description: "Siziń jüklegen faylıńız yaki tekstıńızden AI arqalı ajıratılǵan arnawlı sózlik.",
          level: "B1",
          isCustom: true,
          words: data.words,
        };

        setUnits((prev) => [newUnit, ...prev]);
        setShowCustomModal(false);
        setCustomText("");
        openRangeModal(newUnit);
      }
    } catch (err) {
      console.error(err);
      alert("Tekstti taldawda qátelik júz berdi. Qaytadan urinip kóriń.");
    } finally {
      setIsParsingCustom(false);
    }
  };

  // Filtered Units
  const filteredUnits = units.filter(
    (u) =>
      u.titleKarakalpak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.titleTurkish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Izbe-izliktegi sózlik sınawı</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Qaraqalpaqsha - Túrkshe Bólimler Sózligi
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Bólimler boyınsha izbe-iz testten ótiń yamasa óz oqıw kursıńızdaǵı
              fayldan sózlerdi AI arqalı jüklep, awızsha yamasa jazba túrde soraw-juwap etiń.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>+ Fayl / Tekst Jüklew</span>
            </button>

            {mode !== "unit_select" && (
              <button
                onClick={() => setMode("unit_select")}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Unitlerge Qaytıw</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODE 1: UNIT SELECTION GRID */}
      {mode === "unit_select" && (
        <div className="space-y-4">
          {/* Search bar & filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Unit yaki tema izlew..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div className="text-xs text-slate-400">
              Jámi unitler: <span className="font-bold text-white">{units.length}</span>
            </div>
          </div>

          {/* Grid of Units */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-cyan-950/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Level: {unit.level}
                    </span>
                    {unit.isCustom && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Arnawlı Fayl
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
                    {unit.titleKarakalpak}
                  </h3>
                  <h4 className="text-xs font-medium text-slate-400 mt-0.5 italic">
                    {unit.titleTurkish}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {unit.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Sózler sanı:</span>
                    <span className="font-bold text-slate-200">
                      {unit.words.length} sóz
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedUnit(unit);
                      setCurrentFlashcardIndex(0);
                      setIsFlipped(false);
                      setStudyViewMode("list");
                      setUnitSearchQuery("");
                      setHideTranslations(false);
                      setRevealedWordIds({});
                      setMode("flashcards");
                    }}
                    className="flex items-center justify-center space-x-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold py-2.5 px-3 rounded-xl border border-cyan-500/30 transition cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Yodlaw ({unit.words.length} sóz)</span>
                  </button>

                  <button
                    onClick={() => openRangeModal(unit)}
                    className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>AI Test Baslaw</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 2: UNIT WORDS STUDY (IZBE-IZ LIST & FLASHCARDS) */}
      {mode === "flashcards" && selectedUnit && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Controls & Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Level: {selectedUnit.level}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {selectedUnit.words.length} sóz izbe-iz
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedUnit.titleKarakalpak}
                </h3>
                <p className="text-xs text-slate-400 italic">
                  {selectedUnit.titleTurkish}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openRangeModal(selectedUnit)}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2 px-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer text-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Testti Baslaw</span>
                </button>

                <button
                  onClick={() => setMode("unit_select")}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-3 rounded-xl border border-slate-700 transition cursor-pointer text-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Unitlerge Qaytıw</span>
                </button>
              </div>
            </div>

            {/* View Mode Switcher & In-Unit Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
              {/* Tab Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setStudyViewMode("list")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    studyViewMode === "list"
                      ? "bg-cyan-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Izbe-iz Barshe Sózler ({selectedUnit.words.length})</span>
                </button>
                <button
                  onClick={() => setStudyViewMode("flashcard")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    studyViewMode === "flashcard"
                      ? "bg-cyan-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Jeke Flashcard</span>
                </button>
              </div>

              {/* Tools if in List View */}
              {studyViewMode === "list" && (
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Unittegi sózlerden izlew..."
                      value={unitSearchQuery}
                      onChange={(e) => setUnitSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setHideTranslations(!hideTranslations);
                      setRevealedWordIds({});
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer shrink-0 ${
                      hideTranslations
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                    title={
                      hideTranslations
                        ? "Túrkce awdarmalardı kórsetiw"
                        : "Ózińizdi sınaw ushın awdarmalardı jasırıw"
                    }
                  >
                    {hideTranslations ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>Awdarma Jasırılǵan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Awdarmalardı Jasırıw</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* VIEW TYPE 1: CONTINUOUS SEQUENTIAL LIST OF ALL WORDS */}
          {studyViewMode === "list" && (
            <div className="space-y-3">
              {(() => {
                const filteredWords = selectedUnit.words.filter(
                  (w) =>
                    w.karakalpak.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
                    w.turkish.toLowerCase().includes(unitSearchQuery.toLowerCase())
                );

                if (filteredWords.length === 0) {
                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                      Izlengen sóz tabılmadı: "{unitSearchQuery}"
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-2.5">
                    {filteredWords.map((word, idx) => {
                      const isRevealed = revealedWordIds[word.id];
                      const showTurkish = !hideTranslations || isRevealed;

                      return (
                        <div
                          key={word.id || idx}
                          onClick={() => {
                            if (hideTranslations) {
                              setRevealedWordIds((prev) => ({
                                ...prev,
                                [word.id]: !prev[word.id],
                              }));
                            }
                          }}
                          className={`bg-slate-900 border rounded-2xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:shadow-lg ${
                            hideTranslations && !isRevealed
                              ? "border-slate-800/80 hover:border-amber-500/40 bg-slate-900/80 cursor-pointer"
                              : "border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0">
                            {/* Word Index Badge */}
                            <span className="shrink-0 min-w-[2.25rem] h-9 px-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-cyan-500/40 group-hover:text-cyan-400 transition">
                              #{idx + 1}
                            </span>

                            {/* Word terms */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                {/* Karakalpak Word */}
                                <span className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                                  {word.karakalpak}
                                </span>

                                {word.partOfSpeech && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                    {word.partOfSpeech}
                                  </span>
                                )}
                              </div>

                              {/* Turkish Translation */}
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-500 font-medium">
                                  Túrkshe:
                                </span>
                                {showTurkish ? (
                                  <span className="text-base sm:text-lg font-bold text-cyan-300">
                                    {word.turkish}
                                  </span>
                                ) : (
                                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium cursor-pointer">
                                    Awdarmasın kóriw ushın basıń 👁️
                                  </span>
                                )}
                              </div>

                              {word.exampleTurkish && showTurkish && (
                                <p className="text-xs text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 mt-1">
                                  <span className="font-semibold text-slate-300">
                                    Mısal:
                                  </span>{" "}
                                  {word.exampleTurkish}{" "}
                                  <span className="text-slate-500 italic">
                                    ({word.exampleKarakalpak})
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Audio TTS button */}
                          <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                speakTurkishText(word.turkish);
                              }}
                              className="flex items-center space-x-1.5 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl transition cursor-pointer border border-cyan-500/20 text-xs font-medium"
                              title="Dawıs penen esitiw"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Esitiw</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW TYPE 2: SINGLE INTERACTIVE FLASHCARD */}
          {studyViewMode === "flashcard" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Flashcard Yodlaw Móni
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {selectedUnit.titleKarakalpak}
                  </h3>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                  {currentFlashcardIndex + 1} / {selectedUnit.words.length}
                </span>
              </div>

              {/* Interactive Card */}
              {(() => {
                const card = selectedUnit.words[currentFlashcardIndex];
                return (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[280px] bg-slate-900 border-2 border-slate-800 hover:border-cyan-500/50 rounded-3xl p-8 flex flex-col justify-between items-center text-center transition-all duration-300 shadow-2xl relative overflow-hidden group select-none"
                  >
                    <div className="w-full flex items-center justify-between text-slate-500 text-xs">
                      <span>
                        {isFlipped
                          ? "Túrk Tilinde (Arqa Tápı)"
                          : "Qaraqalpaqsha (Bet Tápı)"}
                      </span>
                      <span className="text-cyan-400 font-medium group-hover:underline flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Aylandırıw ushın basıń
                      </span>
                    </div>

                    <div className="my-auto space-y-3">
                      {!isFlipped ? (
                        <div>
                          <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest block mb-2">
                            Qaraqalpaqsha Sóz
                          </span>
                          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                            {card.karakalpak}
                          </h2>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest block">
                            Túrk Tilinde Awdarması
                          </span>
                          <div className="flex items-center justify-center space-x-3">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-300">
                              {card.turkish}
                            </h2>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                speakTurkishText(card.turkish);
                              }}
                              className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-full transition cursor-pointer"
                              title="Dawıs penen esitiw"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>
                          </div>

                          {card.phonetic && (
                            <p className="text-xs text-slate-400 italic">
                              Oqılıwı: [{card.phonetic}]
                            </p>
                          )}

                          {card.exampleTurkish && (
                            <div className="mt-4 pt-4 border-t border-slate-800 text-left bg-slate-950/60 p-3 rounded-xl">
                              <p className="text-xs font-semibold text-slate-300">
                                Mısal: {card.exampleTurkish}
                              </p>
                              <p className="text-xs text-slate-400 italic mt-0.5">
                                ({card.exampleKarakalpak})
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-slate-500 text-xs">
                      {isFlipped
                        ? "Baska sózge ótiw ushın tómendegi túymelerdi basıń"
                        : "Awdarmasın kóriw ushın kartaga basıń"}
                    </div>
                  </div>
                );
              })()}

              {/* Flashcard Nav Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  disabled={currentFlashcardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold py-3 px-4 rounded-xl border border-slate-700 transition cursor-pointer text-xs sm:text-sm"
                >
                  ← Aldıńǵı Sóz
                </button>

                <button
                  onClick={() => openRangeModal(selectedUnit)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-5 rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer text-xs sm:text-sm flex items-center space-x-1.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Testti Baslaw</span>
                </button>

                <button
                  disabled={
                    currentFlashcardIndex === selectedUnit.words.length - 1
                  }
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFlashcardIndex((prev) =>
                      Math.min(selectedUnit.words.length - 1, prev + 1)
                    );
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold py-3 px-4 rounded-xl border border-slate-700 transition cursor-pointer text-xs sm:text-sm"
                >
                  Kelesi Sóz →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: AI SEQUENTIAL QUIZ TEST */}
      {mode === "quiz" && selectedUnit && !isQuizFinished && (
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-6">
          {(() => {
            const wordsList =
              activeQuizWords.length > 0
                ? activeQuizWords
                : selectedUnit.words;
            const currentWord = wordsList[quizWordIndex];

            return (
              <>
                {/* Progress bar header */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-200 truncate pr-2">
                      Unit: {selectedUnit.titleKarakalpak}
                    </span>
                    <span className="shrink-0">
                      Soraw:{" "}
                      <strong className="text-cyan-400">
                        {quizWordIndex + 1}
                      </strong>{" "}
                      / {wordsList.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{
                        width: `${
                          ((quizWordIndex + 1) / wordsList.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Current Word Test Card */}
                {currentWord && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
                    <div className="text-center space-y-2 bg-slate-950/80 p-3.5 sm:p-5 rounded-2xl border border-slate-800/80">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Sparkles className="w-3 h-3 mr-1" /> AI Examiner Tester
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                        "{currentWord.karakalpak}"
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-400">
                        Usi qaraqalpaqsha sózdiń túrk tilindegi awdarmasın jazıń yaki aytıń:
                      </p>
                    </div>

                    {/* Input form */}
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          disabled={isLoadingCheck || !!currentCheckResult}
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          onFocus={(e) => {
                            setTimeout(() => {
                              e.target.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                            }, 150);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !currentCheckResult) {
                              handleCheckAnswer();
                            }
                          }}
                          placeholder="Túrkce awdarmasın engiziń..."
                          className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-500 text-white font-medium text-base sm:text-lg rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 pr-12 focus:outline-none transition shadow-inner"
                        />

                        {/* Microphone speech button */}
                        <button
                          type="button"
                          disabled={isLoadingCheck || !!currentCheckResult}
                          onClick={startSpeechToText}
                          className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition cursor-pointer ${
                            isListening
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                          title="Daus penen aytıw (Microphone)"
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                      </div>

                      {!currentCheckResult ? (
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <button
                            onClick={handleCheckAnswer}
                            disabled={!userAnswer.trim() || isLoadingCheck}
                            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl shadow-lg shadow-cyan-600/30 transition cursor-pointer flex items-center justify-center space-x-2"
                          >
                            {isLoadingCheck ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>AI Tekserip atır...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Juwaptı Tekseriw</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleSkipWord}
                            disabled={isLoadingCheck}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl sm:rounded-2xl transition cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
                            title="Awdarmasın bilmeymen, keyingisine ótiw"
                          >
                            <ArrowRight className="w-4 h-4 text-amber-400" />
                            <span>Bilmeymen (Ótkizip Jiberiw)</span>
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Result Feedback Banner */}
                    {currentCheckResult && (
                      <div
                        className={`rounded-2xl p-5 border space-y-3 animate-fade-in ${
                          currentCheckResult.isCorrect
                            ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-100"
                            : currentCheckResult.isSkipped
                            ? "bg-amber-950/40 border-amber-500/50 text-amber-100"
                            : "bg-rose-950/40 border-rose-500/50 text-rose-100"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {currentCheckResult.isCorrect ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                            ) : currentCheckResult.isSkipped ? (
                              <HelpCircle className="w-6 h-6 text-amber-400 shrink-0" />
                            ) : (
                              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                            )}
                            <div>
                              <h4 className="font-bold text-base">
                                {currentCheckResult.isCorrect
                                  ? "Aferin! Durıs juwap!"
                                  : currentCheckResult.isSkipped
                                  ? "Ótkizip jiberildi (Bilmeymen)"
                                  : "Qátelik bar"}
                              </h4>
                              <p className="text-xs opacity-90">
                                Durıs Túrkce:{" "}
                                <strong className="underline text-amber-300">
                                  {currentCheckResult.correctTurkish}
                                </strong>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              speakTurkishText(currentCheckResult.correctTurkish)
                            }
                            className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full transition cursor-pointer"
                            title="Dawıs penen esitiw"
                          >
                            <Volume2 className="w-4 h-4 text-cyan-400" />
                          </button>
                        </div>

                        <p className="text-xs leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <strong>AI Túsindirmesi (Qaraqalpaqsha):</strong>{" "}
                          {currentCheckResult.explanationKarakalpak}
                        </p>

                        {currentCheckResult.exampleSentenceTurkish && (
                          <div className="text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                            <p className="font-semibold text-cyan-300">
                              Mısal: {currentCheckResult.exampleSentenceTurkish}
                            </p>
                            <p className="text-slate-400 italic">
                              ({currentCheckResult.exampleSentenceKarakalpak})
                            </p>
                          </div>
                        )}

                        <button
                          onClick={handleNextWord}
                          className="w-full mt-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm py-3 px-6 rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-2"
                        >
                          <span>Kelesi Sózge Ótiw</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* QUIZ FINISHED SUMMARY MODAL */}
      {isQuizFinished && selectedUnit && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Award className="w-8 h-8 text-slate-950" />
            </div>
            <h3 className="text-2xl font-black text-white">
              Unit Test Nátiyjeleri & Analysis
            </h3>
            <p className="text-xs text-slate-400">
              {selectedUnit.titleKarakalpak} – test variantı juqlandı.
            </p>
          </div>

          {/* Stats Breakdown Grid */}
          {(() => {
            const total = quizResultsHistory.length;
            const correctCount = quizResultsHistory.filter((r) => r.isCorrect).length;
            const skippedCount = quizResultsHistory.filter((r) => r.isSkipped).length;
            const incorrectCount = total - correctCount - skippedCount;
            const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

            // Group missed/skipped words by Part of Speech / Topic
            const errorItems = quizResultsHistory.filter((r) => !r.isCorrect);
            const posCounts: Record<string, number> = {};
            errorItems.forEach((item) => {
              const category = item.partOfSpeech || "Basqa sózler";
              posCounts[category] = (posCounts[category] || 0) + 1;
            });

            // Find top error topic/partOfSpeech
            let maxErrorPos = "";
            let maxErrorVal = 0;
            Object.entries(posCounts).forEach(([pos, cnt]) => {
              if (cnt > maxErrorVal) {
                maxErrorVal = cnt;
                maxErrorPos = pos;
              }
            });

            return (
              <div className="space-y-5">
                {/* 4 Cards Stats */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2 bg-slate-900/60 rounded-xl">
                    <span className="text-[11px] text-slate-400 block">Jámı Soraw</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-white">{total}</span>
                  </div>
                  <div className="p-2 bg-emerald-950/40 border border-emerald-500/20 rounded-xl">
                    <span className="text-[11px] text-emerald-300 block">Durıs Juwap</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                      {correctCount}
                    </span>
                  </div>
                  <div className="p-2 bg-rose-950/40 border border-rose-500/20 rounded-xl">
                    <span className="text-[11px] text-rose-300 block">Qáte Juwap</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-rose-400">
                      {incorrectCount}
                    </span>
                  </div>
                  <div className="p-2 bg-amber-950/40 border border-amber-500/20 rounded-xl">
                    <span className="text-[11px] text-amber-300 block">Ótkizilgen</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
                      {skippedCount}
                    </span>
                  </div>
                </div>

                {/* Score Banner */}
                <div className="bg-gradient-to-r from-cyan-950/60 via-slate-950 to-blue-950/60 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        Siziń Umumiylik Nátiyjeńiz: {percent}%
                      </h4>
                      <p className="text-xs text-slate-400">
                        {percent >= 80
                          ? "A'ajap nátiyje! Sózlerdı a'la darajada awdarıp atırsız!"
                          : percent >= 50
                          ? "Jaqsı nátiyje, biraq qátelikler ushırasadı. Qaytalanıw kerek."
                          : "Qosımsha tayarlıq kerek. Qáte sózlerden qaytadan test tapsırıń."}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-cyan-400 pr-2">
                    {percent}%
                  </div>
                </div>

                {/* Topic / Part of Speech Error Analysis Recommendation */}
                {maxErrorVal > 0 && (
                  <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Temalar & Qáteler Analizi (Usınıs):</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Siz bul testte kóbireq{" "}
                      <strong className="text-amber-300 underline font-semibold">
                        "{maxErrorPos}"
                      </strong>{" "}
                      túrindegi sózlerde ({maxErrorVal} qáte) kóbireq qátelik wanderingız. Usı temalardı qaytadan yodlawıńız usınıs etiledi.
                    </p>
                  </div>
                )}

                {/* Review List of Questions */}
                <div className="text-left space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Sorawlar boyınsha tolıq izbe-izlik:</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {errorItems.length} qáte / bilmegen
                    </span>
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                    {quizResultsHistory.map((res, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                          res.isCorrect
                            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                            : res.isSkipped
                            ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                            : "bg-rose-950/20 border-rose-500/30 text-rose-200"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">
                              {idx + 1}. {res.karakalpakWord}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className="font-extrabold underline text-cyan-300">
                              {res.correctTurkish}
                            </span>
                          </div>
                          {!res.isCorrect && (
                            <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                              <span>
                                Siziń juwabıńız:{" "}
                                <strong
                                  className={
                                    res.isSkipped ? "text-amber-300" : "text-rose-300"
                                  }
                                >
                                  "{res.userAnswer}"
                                </strong>
                              </span>
                              {res.partOfSpeech && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">
                                  {res.partOfSpeech}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => speakTurkishText(res.correctTurkish)}
                            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                            title="Túrkce aytılıwı"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          {res.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : res.isSkipped ? (
                            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  {errorItems.length > 0 && (
                    <button
                      onClick={handleRetestMissed}
                      className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-600/20 transition cursor-pointer text-xs sm:text-sm flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Tek Qáte Sózlerden Test Tapsırıw ({errorItems.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => openRangeModal(selectedUnit)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl border border-slate-700 transition cursor-pointer text-xs sm:text-sm"
                  >
                    Tolyq Qaytadan Test Tapshırıw
                  </button>
                  <button
                    onClick={() => setMode("unit_select")}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer text-xs sm:text-sm"
                  >
                    Basqa Unitke Ótiw
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* RANGE SELECTION MODAL */}
      {showRangeModal && rangeUnit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Test Sorawlar Sanın Saylaw
                  </h3>
                  <p className="text-xs text-slate-400">
                    {rangeUnit.titleKarakalpak} (Jámi {rangeUnit.words.length} sóz)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRangeModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Tayar diapazonlar (Presets):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRangeStartInput(1);
                    setRangeEndInput(Math.min(30, rangeUnit.words.length));
                  }}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer text-center"
                >
                  1 - 30 sóz
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRangeStartInput(1);
                    setRangeEndInput(Math.min(50, rangeUnit.words.length));
                  }}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer text-center"
                >
                  1 - 50 sóz
                </button>
                {rangeUnit.words.length >= 51 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRangeStartInput(51);
                      setRangeEndInput(Math.min(100, rangeUnit.words.length));
                    }}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer text-center"
                  >
                    51 - 100 sóz
                  </button>
                )}
                {rangeUnit.words.length >= 101 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRangeStartInput(101);
                      setRangeEndInput(Math.min(150, rangeUnit.words.length));
                    }}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer text-center"
                  >
                    101 - 150 sóz
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setRangeStartInput(1);
                    setRangeEndInput(rangeUnit.words.length);
                  }}
                  className="col-span-2 sm:col-span-1 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer text-center"
                >
                  Barlıq sózler (1 - {rangeUnit.words.length})
                </button>
              </div>
            </div>

            {/* Custom range inputs */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">
                Ózińiz qalegen diapazondı kiritiń:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Baslanıwı (1-{rangeUnit.words.length}):
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={rangeUnit.words.length}
                    value={rangeStartInput}
                    onChange={(e) =>
                      setRangeStartInput(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-center rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Tamamlanıwı:
                  </span>
                  <input
                    type="number"
                    min={rangeStartInput}
                    max={rangeUnit.words.length}
                    value={rangeEndInput}
                    onChange={(e) =>
                      setRangeEndInput(
                        Math.max(
                          rangeStartInput,
                          parseInt(e.target.value) || rangeStartInput
                        )
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-center rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Calculation note */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
              <span>Testtekı sorawlar sanı:</span>
              <span className="font-extrabold text-cyan-400 text-sm">
                {Math.max(
                  1,
                  Math.min(rangeEndInput, rangeUnit.words.length) -
                    Math.max(1, rangeStartInput) +
                    1
                )}{" "}
                sóz
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRangeModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm cursor-pointer"
              >
                Biypul Etıw
              </button>
              <button
                type="button"
                onClick={() =>
                  handleConfirmRangeStart(rangeStartInput, rangeEndInput)
                }
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 text-xs sm:text-sm cursor-pointer flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Testti Baslaw</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM COURSE FILE/TEXT UPLOAD MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Kurs Faylınan / Tekstten AI Sózlik Jaratıw
                  </h3>
                  <p className="text-xs text-slate-400">
                    Siziń oqıw kursıńızdaǵı sabaqlıq faylı yaki tekstti nusqalap qoyıń.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Sabaqlıq faylıńızdaǵı yaki konspektıńızdegi tekstti usı jerge nusqalap (paste) qoyıń (Mısıli: Birinshi sabaq: Merhaba - Sälem, Okul - Mektep, Kitap - Kitap, vb.)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition resize-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm cursor-pointer"
              >
                Biypul Etıw
              </button>
              <button
                onClick={handleParseCustomText}
                disabled={!customText.trim() || isParsingCustom}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 text-xs sm:text-sm cursor-pointer flex items-center space-x-2"
              >
                {isParsingCustom ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI Analiz qılıp atır...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Sózlik Jaratıw</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
