import { VocabularyUnit } from "../types";
import { parseRawVocabulary } from "./parseVocabulary";

export const BUILT_IN_UNITS: VocabularyUnit[] = parseRawVocabulary();
