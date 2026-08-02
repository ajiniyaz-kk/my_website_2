import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to safely get Gemini instance
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY process variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Qaraqalpaq - Túrk Tili AI Server active" });
});

// 1. Vocabulary AI Translation & Verification Endpoint
app.post("/api/vocabulary/check", async (req, res) => {
  try {
    const { karakalpakWord, userTurkishAnswer, unitContext } = req.body;
    
    if (!karakalpakWord || !userTurkishAnswer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ai = getGeminiClient();
    const prompt = `Siz Qaraqalpaq hám Túrk tilleri boyınsha ekspert oqıtıwshısız.
ÁHMIYETLI LINGVISTIKATALABI: Barlıq túsindirmeler hám tekstlerdi TAZA, DURIS QARAQALPAQ TILINDE (á, ǵ, ó, ń, í, ú áripleri menen) jazıń. Ózbeksha sózler ("bilen", "yodlaw", "insho", "daraja") MÚLDE qullanılmasın! "menen"/"hám", "úyreniw"/"jatlaw", "shıǵarma", "dáreje" sózlerin qullanıń.

Tapsırma: Oqıwshıǵa qaraqalpaqsha "${karakalpakWord}" sózi berilgen hám ol túrk tilinde "${userTurkishAnswer}" dep juwap berdi.
Unit teması: ${unitContext || "Gúnlik sózler"}.

Tólem hám bahalaw kriteriyaları:
1. IsCorrect: Juwap durıs yaki durısqa baǵdarlas bolsa (sinonimler, kishi árip qátelikleri, ekilendi sózler esapqa alınsın) true, bolmasa false.
2. AccuracyScore: 0 den 100 ge shekem durıslıq procenti.
3. CorrectTurkish: En durıs hám ápiwayı túrkce awdarması (hám basqa túsip qalǵan áhmiyetli sinonimleri).
4. ExplanationKarakalpak: Qaraqalpaq tilinde juwapqa qısqa, ıqsham hám túsinikli túsinik, grammatika yaki qullanılıwı haqqında eslatma.
5. ExampleSentenceTurkish: Sol sóz qullanılǵan 1 ápiwayı túrkce gápshilik mısal.
6. ExampleSentenceKarakalpak: Sol gáptiń qaraqalpaqsha awdarması.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            accuracyScore: { type: Type.NUMBER },
            correctTurkish: { type: Type.STRING },
            explanationKarakalpak: { type: Type.STRING },
            exampleSentenceTurkish: { type: Type.STRING },
            exampleSentenceKarakalpak: { type: Type.STRING },
          },
          required: [
            "isCorrect",
            "accuracyScore",
            "correctTurkish",
            "explanationKarakalpak",
            "exampleSentenceTurkish",
            "exampleSentenceKarakalpak",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("Vocabulary check error:", error);
    return res.status(500).json({ error: error.message || "Failed to check translation" });
  }
});

// 2. Custom File/Text Words Extractor & Translator
app.post("/api/vocabulary/parse-custom", async (req, res) => {
  try {
    const { customContent } = req.body;
    if (!customContent) {
      return res.status(400).json({ error: "No custom text content provided" });
    }

    const ai = getGeminiClient();
    const prompt = `Siz Ózbekstan hám Qaraqalpaqstan oqıwshıları ushın til úyreniw AI yárdemshisisiz.
Tómendegi tekst yaki fayl mazmunınan eń áhmiyetli Túrkce hám Qaraqalpaqsha sózler dizimin ajıratıp, olar ushın oqıw birligin (Custom Unit) jaratıp beriń:

Tekst:
"""
${customContent.slice(0, 4000)}
"""

Tólem strukturası (JSON):
- unitTitle: Mazmunǵa mas tema ataması (Qaraqalpaqsha)
- words: [
    {
      id: string,
      karakalpak: string (Qaraqalpaqsha sóz/ańlatpa),
      turkish: string (Túrk tilindegi durıs awdarması),
      phonetic: string (oqılıwı/aytılıwı),
      exampleTurkish: string,
      exampleKarakalpak: string
    }
  ] (10-15 en áhmiyetli sóz ajıratılsın)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            unitTitle: { type: Type.STRING },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  karakalpak: { type: Type.STRING },
                  turkish: { type: Type.STRING },
                  phonetic: { type: Type.STRING },
                  exampleTurkish: { type: Type.STRING },
                  exampleKarakalpak: { type: Type.STRING },
                },
                required: ["id", "karakalpak", "turkish"],
              },
            },
          },
          required: ["unitTitle", "words"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("Parse custom words error:", error);
    return res.status(500).json({ error: error.message || "Failed to process text" });
  }
});

// 3. Speaking / Konuşma AI Tutor Chat
app.post("/api/speaking/chat", async (req, res) => {
  try {
    const { messages, topic, cefrLevel } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `Siz Shet tillerin biliw sertifikatı (TÖMER / CEFR ${cefrLevel || "B2"}) Túrk tili awızsha sınav (Speaking) komissiyası aǵzası hám AI oqıtıwshısız.
ÁHMIYETLI LINGVISTIKATALABI: Barlıq túsindirme hám grammatikalıq pikirlerdi TAZA, DURIS QARAQALPAQ TILINDE (á, ǵ, ó, ń, í, ú áripleri menen) berıń. Ózbeksha sózler ("bilen", "yodlaw", "insho", "daraja") MÚLDE qullanılmasın! "menen"/"hám", "úyreniw"/"jatlaw", "shıǵarma", "dáreje" sózlerin qullanıń.

Múratıńız:
1. Paydalanıwshı menen Túrk tilinde tábiyiy, qızıqlı hám sertifikat standartlarına mas dialóg alıp barıw.
2. Tema: "${topic || "Serbest Konuşma ve Kendini Tanıtma"}".
3. Paydalanıwshınıń hár bir juwabın talıllaw hám:
   - Grammatikalıq hám kelime qáteliklerin kórsetiw (Karakalpak tilinde túsindiriw),
   - Jaqsıraq bal beriwshi alternative Túrkce gápler (Better Expressions) usınıs etiw,
   - Sınawdı dawam ettiriw ushın kelesi soraw beriw (Túrk tilinde).

JSON Juwap Yapısı:
- replyTurkish: Siziń paydalanıwshıǵa beretuǵın Túrk tilindegi pikirıńiz yaki kelesi soravıńız.
- grammarFeedbackKarakalpak: Paydalanıwshınıń gáplerindegi qátelikler hám grammatika boyınsha Qaraqalpaqsha pikir (eger qátelik bolmasa, maqtov bildiriń).
- betterPhrasesTurkish: [ "1-2 durıs hám baııraq gáp usınısı" ].
- CEFRScoreEstimate: CEFR dárejesi baǵalawı (A1, A2, B1, B2, C1).`;

    const chatFormatted = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `System instruction:\n${systemInstruction}\n\nLütfen cevabını ver.` }],
        },
        ...chatFormatted,
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyTurkish: { type: Type.STRING },
            grammarFeedbackKarakalpak: { type: Type.STRING },
            betterPhrasesTurkish: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            CEFRScoreEstimate: { type: Type.STRING },
          },
          required: [
            "replyTurkish",
            "grammarFeedbackKarakalpak",
            "betterPhrasesTurkish",
            "CEFRScoreEstimate",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("Speaking chat error:", error);
    return res.status(500).json({ error: error.message || "Failed in speaking chat" });
  }
});

// 4. Writing / Yazma Evaluation Endpoint
app.post("/api/writing/evaluate", async (req, res) => {
  try {
    const { taskTitle, taskPrompt, userEssay, cefrLevel } = req.body;

    if (!userEssay || userEssay.trim().length < 10) {
      return res.status(400).json({ error: "Incomplete essay content" });
    }

    const ai = getGeminiClient();

    const prompt = `Siz DTM / Bilim hám kásipıylik kónlikpelerin bahalaw agentligi hám TÖMER sertifikat sınavı 'Yazma' (Writing) bólimi ekspertisiz.
ÁHMIYETLI LINGVISTIKATALABI: Barlıq túsindirme hám xulosalardı TAZA, TÁBIYIY QARAQALPAQ TILINDE (á, ǵ, ó, ń, í, ú áripleri menen) berıń. Ózbeksha sózler ("bilen", "yodlaw", "insho", "daraja") MÚLDE qullanılmasın! "menen"/"hám", "úyreniw"/"jatlaw", "shıǵarma", "dáreje" sózlerin qullanıń.

Sınaw Talabı:
- Level: ${cefrLevel || "B2"}
- Tapsırma teması: "${taskTitle}"
- Tapsırma mazmunı: "${taskPrompt}"
- Oqıwshı jazǵan shıǵarma/xat:
"""
${userEssay}
"""

Íltımas, tómendegi rásmiy Shet tillerin biliw sertifikat kriteriyaları boyınsha 30 ballıq sistemada bahalań:
1. Task Fulfillment (Görev Tamamlama): 0-7.5 ball
2. Coherence & Cohesion (Bütünlük ve Bağdaşıklık): 0-7.5 ball
3. Vocabulary (Kelime Zenginliği): 0-7.5 ball
4. Grammar & Accuracy (Grammatika ve Doğruluk): 0-7.5 ball

JSON Juvap Yapısı:
- totalScore: jámı bal (max 30)
- CEFRBand: A1, A2, B1, B2, C1, C2
- taskFulfillmentScore: number (0-7.5)
- coherenceScore: number (0-7.5)
- vocabularyScore: number (0-7.5)
- grammarScore: number (0-7.5)
- generalFeedbackKarakalpak: Qaraqalpaqsha ulıwma bahalaw hám nátije haqqında xulosa
- strengthsKarakalpak: [ "Kúshli tárepleri" ]
- weaknessesKarakalpak: [ "Islew kerek bolǵan kemshilikler" ]
- correctedEssayTurkish: Jazılǵan shıǵarmanıń durıslanǵan, túsirilip qaldırılǵan qáteler joytılǵan ideal túrkce nusqası`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalScore: { type: Type.NUMBER },
            CEFRBand: { type: Type.STRING },
            taskFulfillmentScore: { type: Type.NUMBER },
            coherenceScore: { type: Type.NUMBER },
            vocabularyScore: { type: Type.NUMBER },
            grammarScore: { type: Type.NUMBER },
            generalFeedbackKarakalpak: { type: Type.STRING },
            strengthsKarakalpak: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            weaknessesKarakalpak: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctedEssayTurkish: { type: Type.STRING },
          },
          required: [
            "totalScore",
            "CEFRBand",
            "taskFulfillmentScore",
            "coherenceScore",
            "vocabularyScore",
            "grammarScore",
            "generalFeedbackKarakalpak",
            "strengthsKarakalpak",
            "weaknessesKarakalpak",
            "correctedEssayTurkish",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("Writing evaluate error:", error);
    return res.status(500).json({ error: error.message || "Failed to evaluate writing" });
  }
});

// 5. Reading / Okuma Generator & Assessor
app.post("/api/reading/generate", async (req, res) => {
  try {
    const { level, category } = req.body;

    const ai = getGeminiClient();
    const prompt = `Siz Ózbekstandaǵı Túrk tili Shet tili sertifikatı (CEFR ${level || "B2"}) Oqıw (Reading) sınavı ushın original mətin hám test sorawların jaratıwshısız.

Tema kategoryası: ${category || "Kültür, Bilim ve Toplum"}.

JSON Juvap Yapısı:
- titleTurkish: Mətin ataması (Túrksha)
- titleKarakalpak: Mətin ataması (Qaraqalpaqsha awdarma)
- passageTurkish: 150-250 sózlik CEFR ${level || "B2"} dárrejesindegi mazmunlı Túrksha mətin.
- vocabularyNotes: [
    { turkishWord: string, karakalpakMeaning: string, explanation: string }
  ] (Mətindegi eń áhmiyetli 4-5 sóz)
- questions: [
    {
      id: number,
      questionTurkish: string,
      questionKarakalpak: string,
      options: [ string, string, string, string ],
      correctIndex: number (0, 1, 2, yaki 3),
      explanationKarakalpak: string
    }
  ] (4 dana test sorawı)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleTurkish: { type: Type.STRING },
            titleKarakalpak: { type: Type.STRING },
            passageTurkish: { type: Type.STRING },
            vocabularyNotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  turkishWord: { type: Type.STRING },
                  karakalpakMeaning: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["turkishWord", "karakalpakMeaning"],
              },
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  questionTurkish: { type: Type.STRING },
                  questionKarakalpak: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.NUMBER },
                  explanationKarakalpak: { type: Type.STRING },
                },
                required: [
                  "id",
                  "questionTurkish",
                  "questionKarakalpak",
                  "options",
                  "correctIndex",
                  "explanationKarakalpak",
                ],
              },
            },
          },
          required: ["titleTurkish", "passageTurkish", "questions"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("Reading generate error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate reading material" });
  }
});

// 6. AI News & Articles Generator Endpoint
app.post("/api/news/generate", async (req, res) => {
  try {
    const { topicPrompt, category } = req.body;

    const ai = getGeminiClient();
    const prompt = `Siz Ózbekstan hám Qaraqalpaqstandaǵı Túrk tili úyreniwshileri ushın eń joqarı dárrejedegi bilim beriwshi AI redaktorsız.
Tema: "${topicPrompt || "TÖMER B2 Sertifikat sınavına tayarlanıp atırǵanlar ushın maslahatlar"}"
Kategoriya: "${category || "Exam"}".

Tólem strukturası (JSON):
- titleKarakalpak: Qaraqalpaqsha tartımlı sarlavha
- titleTurkish: Túrksha atama
- category: "Exam", "Grammar", "Culture", yaki "Vocabulary"
- summaryKarakalpak: Maqala haqida 2-3 gáplik qısqa Mazmun (Qaraqalpaqsha)
- contentTurkish: Túrk tilindegi 150-250 sózlik tolıq, maǵlıwmatlı tekst
- contentKarakalpak: Sol maqlanıń Qaraqalpaq tilindegi mazmunı hám túsindirmesi
- author: "AI Túrk Tili Ekspert Redaktsiyası"
- readTimeMinutes: 3
- featuredWord: {
    turkish: string (mətindegi eń zıúr sóz),
    karakalpak: string (awdarması),
    example: string (gápte qullanılıwı)
  }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleKarakalpak: { type: Type.STRING },
            titleTurkish: { type: Type.STRING },
            category: { type: Type.STRING },
            summaryKarakalpak: { type: Type.STRING },
            contentTurkish: { type: Type.STRING },
            contentKarakalpak: { type: Type.STRING },
            author: { type: Type.STRING },
            readTimeMinutes: { type: Type.NUMBER },
            featuredWord: {
              type: Type.OBJECT,
              properties: {
                turkish: { type: Type.STRING },
                karakalpak: { type: Type.STRING },
                example: { type: Type.STRING },
              },
              required: ["turkish", "karakalpak", "example"],
            },
          },
          required: [
            "titleKarakalpak",
            "titleTurkish",
            "category",
            "summaryKarakalpak",
            "contentTurkish",
            "contentKarakalpak",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("News generate error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate news article" });
  }
});

// 7. Quick Turkish to Karakalpak Translator
app.post("/api/translate", async (req, res) => {
  try {
    const { textTurkish } = req.body;
    if (!textTurkish) {
      return res.status(400).json({ error: "Missing textTurkish parameter" });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Tómendegi Túrkce mətindi Qaraqalpaq tiline mánisiz hám aniq awdarıp beriń:\n"${textTurkish}"`,
    });

    return res.json({ translationKarakalpak: response.text?.trim() || "" });
  } catch (error: any) {
    console.error("Translate error:", error);
    return res.status(500).json({ error: "Translation failed" });
  }
});

// Start Express server and Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Qaraqalpaq - Túrk Tili AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
