/**
 * Text AI-generation estimator.
 *
 * A transparent, weighted heuristic over stylometric features that current
 * LLM output tends to exhibit in its default "assistant" register:
 *
 *  - low burstiness (uniform sentence lengths)
 *  - narrow sentence-length band (~14-24 words)
 *  - low contraction rate, formal register
 *  - over-represented LLM-favoured connectives / vocabulary
 *  - very regular punctuation, few fragments / rhetorical marks
 *  - uniform paragraph lengths
 *
 * The feature set is language-aware (English / French, auto-detected): each
 * language has its own LLM-favoured lexicon, register markers (English
 * contractions vs. French colloquialisms; French elisions such as l'/d' are
 * grammatical, not informal), first-person pronouns and sentence-length band.
 *
 * This is an ESTIMATE. It has a real false-positive rate on edited, translated,
 * technical or non-native writing, and short samples. It does not identify a
 * model or prove authorship. Always shown with that caveat.
 */
import { t } from '@/i18n';
import { detectLanguage, type ContentLanguage } from './language';

export interface TextAiSignal {
  label: string;
  detail: string;
  weight: number;
}

export interface TextAiResult {
  probability: number; // 0-100
  signals: TextAiSignal[];
  reliable: boolean; // false for short samples
  language?: ContentLanguage;
}

const LLM_LEXICON_EN = [
  'delve', 'delving', 'tapestry', 'nuanced', 'nuance', 'realm', 'landscape',
  'navigating', 'navigate the complexities', 'underscore', 'underscores',
  'boasts', 'showcasing', 'leverage', 'leveraging', 'robust', 'seamless',
  'seamlessly', 'crucial', 'pivotal', 'notably', 'consequently', 'furthermore',
  'moreover', 'additionally', 'however, it', 'in conclusion', 'in summary',
  'it is important to note', 'it is worth noting', 'a testament to',
  'plays a significant role', 'plays a crucial role', 'the world of',
  'in the realm of', 'a wide range of', 'a variety of', 'foster', 'fostering',
  'holistic', 'multifaceted', 'paradigm', 'synergy', 'elevate', 'unlock',
  'game-changer', 'cutting-edge', 'ever-evolving', 'ever-changing',
  'when it comes to', 'dive into', 'let us explore', "let's explore",
];

// Stock phrasing over-produced by assistants writing in French.
const LLM_LEXICON_FR = [
  'il est important de noter', 'il convient de noter', 'il est essentiel de',
  'il est crucial de', 'force est de constater', 'en outre', 'par ailleurs',
  'de surcroît', 'en conclusion', 'en somme', 'en résumé', 'en définitive',
  'en fin de compte', 'dans un monde où', "à l'ère du", "à l'ère de", "à l’ère du",
  'paysage numérique', 'dans le paysage', 'joue un rôle crucial', 'joue un rôle clé',
  'un rôle essentiel', 'un rôle central', 'crucial', 'cruciale', 'incontournable',
  'pierre angulaire', 'clé de voûte', 'changer la donne', 'révolutionner',
  'en constante évolution', 'en perpétuelle évolution', 'en pleine mutation',
  'tirer parti', 'exploiter pleinement', 'naviguer dans', 'plonger dans',
  'au cœur de', 'mettre en lumière', 'met en lumière', 'témoigne de', 'souligne',
  'favoriser', 'renforcer', 'optimiser', 'levier', 'synergie', 'holistique',
  'robuste', 'fluide', 'multidimensionnel', 'indéniablement', 'incontestablement',
  'sans aucun doute', 'véritable', 'enjeux', 'transparence',
];

// Colloquial markers: their absence signals the formal assistant register.
const INFORMAL_FR = [
  'ouais', 'bah', 'ben', 'genre', 'truc', 'trucs', 'machin', "y'a", 'y’a', "t'es",
  't’es', "t'as", 't’as', "j'sais", 'chais', 'perso', 'sympa', 'carrément',
  'franchement', 'du coup', 'bref', 'ok', 'hein', 'mouais', 'grave', 'boulot',
  'bosser', 'mec', 'nan', 'ouf', 'bof', 'ça',
];

interface LanguageProfile {
  lexicon: string[];
  /** Register markers per 1000 words; low = formal. */
  register: (lower: string, words: string[]) => number;
  registerKey: 'contractions' | 'informal';
  firstPerson: RegExp;
  sentenceCenter: number;
  sentenceBand: string;
}

const PROFILES: Record<ContentLanguage, LanguageProfile> = {
  en: {
    lexicon: LLM_LEXICON_EN,
    register: (lower, words) =>
      ((lower.match(/\b\w+['’](t|s|re|ve|ll|d|m)\b/g) ?? []).length / words.length) * 1000,
    registerKey: 'contractions',
    firstPerson: /\b(i|me|my|mine|myself)\b/g,
    sentenceCenter: 19,
    sentenceBand: '15-24',
  },
  fr: {
    lexicon: LLM_LEXICON_FR,
    register: (_lower, words) =>
      (words.filter((w) => INFORMAL_FR.includes(w.toLowerCase())).length / words.length) * 1000,
    registerKey: 'informal',
    firstPerson: /(?:^|[^\p{L}])(?:(?:je|moi|mon|ma|mes)(?!\p{L})|[jm]['’])/gu,
    sentenceCenter: 21,
    sentenceBand: '17-27',
  },
};

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+(?=[\p{Lu}"'«(])/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function analyzeTextAi(text: string): TextAiResult {
  const clean = text.trim();
  const language = detectLanguage(clean);
  const profile = PROFILES[language];
  const words = clean.match(/[\p{L}'’]+/gu) ?? [];
  const wordCount = words.length;
  const sentences = splitSentences(clean);
  const paragraphs = clean.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  if (wordCount < 60 || sentences.length < 4) {
    return {
      probability: 0,
      signals: [],
      reliable: false,
      language,
    };
  }

  const sentLens = sentences.map((s) => (s.match(/[\p{L}']+/gu) ?? []).length).filter((n) => n > 0);
  const meanLen = sentLens.reduce((a, b) => a + b, 0) / sentLens.length;
  const sd = Math.sqrt(sentLens.reduce((a, b) => a + (b - meanLen) ** 2, 0) / sentLens.length);
  const burstiness = meanLen > 0 ? sd / meanLen : 1; // low = uniform = AI-ish

  const lower = clean.toLowerCase();
  const registerRate = profile.register(lower, words);

  const lexHits = profile.lexicon.reduce(
    (a, w) => a + (lower.split(w).length - 1),
    0,
  );
  const lexRate = (lexHits / wordCount) * 1000;

  const exclamations = (clean.match(/!/g) ?? []).length;
  const questions = (clean.match(/\?/g) ?? []).length;
  const ellipses = (clean.match(/\.\.\.|…/g) ?? []).length;
  const fragments = sentLens.filter((n) => n <= 3).length;
  const punctVariety =
    (exclamations > 0 ? 1 : 0) + (questions > 0 ? 1 : 0) + (ellipses > 0 ? 1 : 0) + (fragments > 0 ? 1 : 0);

  const paraLens = paragraphs.map((p) => (p.match(/[\p{L}']+/gu) ?? []).length).filter((n) => n > 0);
  const paraMean = paraLens.reduce((a, b) => a + b, 0) / Math.max(1, paraLens.length);
  const paraSd = Math.sqrt(
    paraLens.reduce((a, b) => a + (b - paraMean) ** 2, 0) / Math.max(1, paraLens.length),
  );
  const paraUniformity = paraLens.length >= 3 && paraMean > 0 ? 1 - Math.min(1, paraSd / paraMean) : 0;

  const firstPerson = (lower.match(profile.firstPerson) ?? []).length / wordCount;

  const signals: TextAiSignal[] = [];

  const sBurst = sigmoid((0.5 - burstiness) * 7);
  signals.push({
    label: t('engine.text.burstiness'),
    detail: t('engine.text.burstinessDetail', { value: burstiness.toFixed(2) }),
    weight: sBurst,
  });

  const sBand = sigmoid((5 - Math.abs(meanLen - profile.sentenceCenter)) * 0.5);
  signals.push({
    label: t('engine.text.sentence'),
    detail: t('engine.text.sentenceDetail', { value: meanLen.toFixed(1), band: profile.sentenceBand }),
    weight: sBand * 0.6,
  });

  const sContr = sigmoid((3 - registerRate) * 0.9);
  signals.push({
    label: t(`engine.text.${profile.registerKey}`),
    detail: t(`engine.text.${profile.registerKey}Detail`, { value: registerRate.toFixed(1) }),
    weight: sContr * 0.7,
  });

  const sLex = sigmoid((lexRate - 4) * 0.7);
  signals.push({
    label: t('engine.text.lexicon'),
    detail: t('engine.text.lexiconDetail', { hits: lexHits, rate: lexRate.toFixed(1) }),
    weight: sLex,
  });

  const sPunct = sigmoid((1.5 - punctVariety) * 1.4);
  signals.push({
    label: t('engine.text.punctuation'),
    detail: t('engine.text.punctuationDetail', { value: punctVariety }),
    weight: sPunct * 0.6,
  });

  if (paraUniformity > 0) {
    signals.push({
      label: t('engine.text.paragraphs'),
      detail: t('engine.text.paragraphsDetail', { value: paraUniformity.toFixed(2) }),
      weight: sigmoid((paraUniformity - 0.6) * 6) * 0.5,
    });
  }

  if (firstPerson < 0.004) {
    signals.push({
      label: t('engine.text.voice'),
      detail: t('engine.text.voiceDetail'),
      weight: 0.3,
    });
  }

  const active = signals.filter((s) => s.weight > 0.05);
  const total = active.reduce((a, s) => a + s.weight, 0);
  const maxTotal = 1.0 + 0.6 + 0.7 + 1.0 + 0.6 + 0.5 + 0.3;
  const raw = sigmoid((total / maxTotal - 0.32) * 7);
  const probability = Math.round(Math.min(95, Math.max(3, raw * 100)));

  return {
    probability,
    signals: active.sort((a, b) => b.weight - a.weight),
    reliable: wordCount >= 120,
    language,
  };
}
