import React from "react";
import {
  Award,
  Sparkles,
  CheckCircle2,
  BookOpen,
  FileText,
  MessageSquare,
  PenTool,
  Headphones,
  Zap,
  Globe,
  Info,
} from "lucide-react";

export const SertifikatInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Award className="w-4 h-4" />
              <span>Ózbekstan Sharayatı & AI Model Maǵlıwmatı</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Shet Tillerin Biliw Sertifikatı (Túrk Tili / TÖMER)
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Qaraqalpaq tili tasıwshıları ushın Ózbekstan Bilim hám kásipıylik kónlikpelerin bahalaw agentligi (DTM) hám Türkiye TÖMER sertifikat sınavına tayarlanıw baǵdarlaması.
            </p>
          </div>
        </div>
      </div>

      {/* EXAM STRUCTURE & SCORING */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-cyan-500/50 transition">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl w-fit">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">1. Oqıw (Reading)</h3>
          <span className="text-xs font-bold text-cyan-400 block">30 Ball</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            3-4 túrkce original mətin, 30 dana test sorawı. CEFR B2/C1 dárrejesindegi sabaqlıq hám ilimiy tekstlerdi túsiniw.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-cyan-500/50 transition">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit">
            <Headphones className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">2. Tıńlaw (Listening)</h3>
          <span className="text-xs font-bold text-cyan-400 block">30 Ball</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Audıo dialóglar, jańalıqlar hám monológlardı tıńlap, mazmunın tuwrı túsiniw boyınsha test sorawları.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-cyan-500/50 transition">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
            <PenTool className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">3. Jazıw (Writing)</h3>
          <span className="text-xs font-bold text-cyan-400 block">30 Ball</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            2 tapsırma: Rásmiy xat/dilekçe (B1) hám argumentativ insho/essay (B2-C1). Grammatika hám kelime baylıǵı bahalanadı.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-cyan-500/50 transition">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl w-fit">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">4. Söylesiw (Speaking)</h3>
          <span className="text-xs font-bold text-cyan-400 block">30 Ball</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sınawshı menen 3 basqıshlı awızsha mülakat: Tanısıw, Kartochka teması boyınsha shıǵıs etiw hám sora-juwap.
          </p>
        </div>
      </div>

      {/* CERTIFICATE SCORE THRESHOLDS IN UZBEKISTAN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Ózbekstandaǵı Sertifikat Dárrejeleri hám Balllar Sisteması:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="inline-block px-2.5 py-1 bg-blue-500/20 text-blue-300 font-bold rounded">
              B1 Level (Orta)
            </span>
            <p className="text-slate-300">
              Jámı 60 - 74.9 ball. Gúnlik muloqot, awızsha hám jazba gáplerdi ańsat túsinıw imkoniyatan beredi.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded">
              B2 Level (Joqarı Orta)
            </span>
            <p className="text-slate-300">
              Jámı 75 - 89.9 ball. Magistratura, PhD hám mektep/universitet mugallimligi ushın eń kerekli rásmiy sertifikat.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="inline-block px-2.5 py-1 bg-purple-500/20 text-purple-300 font-bold rounded">
              C1 Level (Kásibiy / A'lo)
            </span>
            <p className="text-slate-300">
              Jámı 90 - 120 ball. Maksimal imtiyoz beretuǵın kásibiy hám ilimiy dárreje.
            </p>
          </div>
        </div>
      </div>

      {/* GEMINI AI MODEL EXPLANATION */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
          <Sparkles className="w-5 h-5" />
          <span>Seniń Platformańdaǵı Gemini AI Modeli Haqqında:</span>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            1. <strong>Qaysı model isletiledi?</strong> Platforma backend
            serverinde Google AI Studio'nıń eń sońǵı <strong>Gemini 3.6 Flash</strong> hám
            <strong>Gemini Flash</strong> modelleri qullanılǵan.
          </p>

          <p>
            2. <strong>Biypul qullanıw múmkinshiligi:</strong> Google AI Studio
            ekosistemasındagı Gemini 3.6 Flash hám Gemini Flash modelleri standart API
            kvotaları sheńberinde turaqlı tegin isleydi.
          </p>

          <p>
            3. <strong>Ózbekstan hám Qaraqalpaqstan sharayatına maslıǵı:</strong> AI
            oqıtıwshı Qaraqalpaq tili grammatikası hám túrk tili awdarmaların anıq túsinip,
            pikirlerin Qaraqalpaqsha túsindirip beredi, sol arqalı til úyreniw ańsatlasadı.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-cyan-400" /> Qaraqalpaqstan hám Ózbekstan
            respublikası oqıtıwshı hám studentleri ushın arnawlı islep shıǵıldı.
          </span>
        </div>
      </div>
    </div>
  );
};
