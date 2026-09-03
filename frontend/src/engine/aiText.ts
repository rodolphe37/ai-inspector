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
 * This is an ESTIMATE. It has a real false-positive rate on edited, translated,
 * technical or non-native writing, and short samples. It does not identify a
 * model or prove authorship. Always shown with that caveat.
 */

export interface TextAiSignal {
  label: string;
  detail: string;
  weight: number;
}

export interface TextAiResult {
  probability: number; // 0-100
  signals: TextAiSignal[];
  reliable: boolean; // false for short samples
}

const LLM_LEXICON = [
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

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function analyzeTextAi(text: string): TextAiResult {
  const clean = text.trim();
  const words = clean.match(/[\p{L}']+/gu) ?? [];
  const wordCount = words.length;
  const sentences = splitSentences(clean);
  const paragraphs = clean.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  if (wordCount < 60 || sentences.length < 4) {
    return {
      probability: 0,
      signals: [],
      reliable: false,
    };
  }

  const sentLens = sentences.map((s) => (s.match(/[\p{L}']+/gu) ?? []).length).filter((n) => n > 0);
  const meanLen = sentLens.reduce((a, b) => a + b, 0) / sentLens.length;
  const sd = Math.sqrt(sentLens.reduce((a, b) => a + (b - meanLen) ** 2, 0) / sentLens.length);
  const burstiness = meanLen > 0 ? sd / meanLen : 1; // low = uniform = AI-ish

  const lower = clean.toLowerCase();
  const contractions = (lower.match(/\b\w+['’](t|s|re|ve|ll|d|m)\b/g) ?? []).length;
  const contractionRate = (contractions / wordCount) * 1000;

  const lexHits = LLM_LEXICON.reduce(
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

  const firstPerson = (lower.match(/\b(i|me|my|mine|myself)\b/g) ?? []).length / wordCount;

  const signals: TextAiSignal[] = [];

  const sBurst = sigmoid((0.5 - burstiness) * 7);
  signals.push({
    label: 'Sentence-length burstiness',
    detail: `variation ${burstiness.toFixed(2)} of mean (human prose is usually > 0.5)`,
    weight: sBurst,
  });

  const sBand = sigmoid((5 - Math.abs(meanLen - 19)) * 0.5);
  signals.push({
    label: 'Average sentence length',
    detail: `${meanLen.toFixed(1)} words (LLM default register clusters ~15-24)`,
    weight: sBand * 0.6,
  });

  const sContr = sigmoid((3 - contractionRate) * 0.9);
  signals.push({
    label: 'Contraction rate',
    detail: `${contractionRate.toFixed(1)} per 1000 words (formal / low = AI-leaning)`,
    weight: sContr * 0.7,
  });

  const sLex = sigmoid((lexRate - 4) * 0.7);
  signals.push({
    label: 'LLM-favoured vocabulary',
    detail: `${lexHits} marker phrase(s) — ${lexRate.toFixed(1)} per 1000 words`,
    weight: sLex,
  });

  const sPunct = sigmoid((1.5 - punctVariety) * 1.4);
  signals.push({
    label: 'Punctuation variety',
    detail: `${punctVariety}/4 of {!, ?, …, fragments} present`,
    weight: sPunct * 0.6,
  });

  if (paraUniformity > 0) {
    signals.push({
      label: 'Paragraph uniformity',
      detail: `${paraUniformity.toFixed(2)} (evenly sized paragraphs)`,
      weight: sigmoid((paraUniformity - 0.6) * 6) * 0.5,
    });
  }

  if (firstPerson < 0.004) {
    signals.push({
      label: 'Personal voice',
      detail: 'Very little first-person / lived-experience language',
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
  };
}
