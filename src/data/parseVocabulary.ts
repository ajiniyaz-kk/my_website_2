import { VocabularyUnit, WordItem } from "../types";
import { RAW_VOCABULARY_TEXT } from "./rawVocabulary";

function cleanString(str: string): string {
  return str.trim();
}

export function parseRawVocabulary(): VocabularyUnit[] {
  const lines = RAW_VOCABULARY_TEXT.split("\n");

  const unitsMap = new Map<string, VocabularyUnit>();

  let currentLevel: "A1" | "A2" | "B1" | "B2" | "C1" = "A1";
  let currentUnitNum = 1;
  let currentPartOfSpeech = "Noun";

  function getUnitKey(level: string, unitNum: number): string {
    return `${level}_U${unitNum}`;
  }

  function ensureUnit(level: "A1" | "A2" | "B1" | "B2" | "C1", unitNum: number): VocabularyUnit {
    const key = getUnitKey(level, unitNum);
    if (!unitsMap.has(key)) {
      const titles: Record<number, { tr: string; kk: string }> = {
        1: { tr: "Temel Tanışma ve İsimler", kk: "Tiykarǵı Tanısıw hám Atamalar" },
        2: { tr: "Günlük Yaşam ve Çevre", kk: "Kúndelik Turmıs hám Atrap" },
        3: { tr: "Zaman, Mekan ve Aktiviteler", kk: "Waqıt, Orın hám Is-háreketler" },
        4: { tr: "Aile, Meslekler hám İletişim", kk: "Ańlaǵı, Kásip hám Sóylesiw" },
        5: { tr: "Kültür, Kutlamalar ve Duygular", kk: "Mádaniyat, Bayramlar hám Sezimler" },
        6: { tr: "Sağlık, Doğa ve Seyahat", kk: "Den-sawlıq, Tábiyat hám Sayahat" },
      };

      const title = titles[unitNum] || {
        tr: `Ünite ${unitNum}`,
        kk: `${unitNum}-Bólim`,
      };

      unitsMap.set(key, {
        id: `builtin_${level.toLowerCase()}_u${unitNum}`,
        level,
        unitNumber: unitNum,
        titleTurkish: `Túrk Tili ${level} - ${unitNum}. Ünite: ${title.tr}`,
        titleKarakalpak: `${level} Daraja - ${unitNum}-Bólim: ${title.kk}`,
        description: `${level} seviyesi ${unitNum}-ünite sözleri`,
        iconName: "BookOpen",
        words: [],
      });
    }
    return unitsMap.get(key)!;
  }

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Check level headers
    const levelMatch = line.match(/^(A\s*1|A\s*2|B\s*1|B\s*2|C\s*1)$/i);
    if (levelMatch) {
      const levStr = levelMatch[1].replace(/\s+/g, "").toUpperCase();
      currentLevel = levStr as "A1" | "A2" | "B1" | "B2" | "C1";
      currentUnitNum = 1;
      continue;
    }

    // Check unit headers
    // e.g. "1.ünite", "2.ünite sözlük", "3.DERS SÖZLÜK", "ÜNİTE 2.", "3-ÜNİTE", "4. ÜNİTENİN KELİMELERİ", "Yeni İstanbul B2 Ünite 1", "Yeni İstanbul C1 Ünite 2"
    const unitMatch = line.match(/(?:Yeni İstanbul\s*)?(?:[ABC][12]\s*)?(?:ÜNİTE|ünite|Ünite)\s*(\d+)/i) ||
                      line.match(/^(\d+)[\.\-]\s*(?:ünite|ÜNİTE|DERS)/i) ||
                      line.match(/^(\d+)[\.\-]\s*ünite/i);
    
    if (unitMatch) {
      const num = parseInt(unitMatch[1], 10);
      if (!isNaN(num) && num >= 1 && num <= 10) {
        currentUnitNum = num;
        continue;
      }
    }

    // Check section headers
    const lowerLine = line.toLowerCase();
    if (lowerLine === "isimler" || lowerLine === "isimler:") {
      currentPartOfSpeech = "Isim (Noun)";
      continue;
    }
    if (lowerLine === "fiiller" || lowerLine === "fiiller:") {
      currentPartOfSpeech = "Fe'l (Verb)";
      continue;
    }
    if (lowerLine.includes("kalip ifadeler") || lowerLine.includes("kalıp ifadeler")) {
      currentPartOfSpeech = "Gep / İfade";
      continue;
    }
    if (lowerLine === "sözlük" || lowerLine === "3.ders sözlük") {
      continue;
    }

    // Word entry parser
    // Expecting line format: "turkish - karakalpak/uzbek" or "turkish -karakalpak"
    if (line.includes("-")) {
      const dashIdx = line.indexOf("-");
      const turkishPart = cleanString(line.substring(0, dashIdx));
      const karakalpakPart = cleanString(line.substring(dashIdx + 1));

      if (turkishPart && karakalpakPart) {
        const unit = ensureUnit(currentLevel, currentUnitNum);
        const wordId = `${unit.id}_w${unit.words.length + 1}`;

        unit.words.push({
          id: wordId,
          turkish: turkishPart,
          karakalpak: karakalpakPart,
          partOfSpeech: currentPartOfSpeech,
          exampleTurkish: `"${turkishPart}" kelimesi günlük konuşmada kullanılır.`,
          exampleKarakalpak: `"${karakalpakPart}" sózi túrk tilinde "${turkishPart}" boladı.`,
        });
      }
    }
  }

  return Array.from(unitsMap.values());
}
