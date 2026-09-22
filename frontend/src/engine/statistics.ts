/**
 * Deterministic statistical text analysis.
 *
 * One statistical signal that feeds the AI-origin verdict, not a verdict on its
 * own. Reports language-model-agnostic distribution statistics: character
 * entropy, letter-frequency deviation from a reference corpus (chi-square), and
 * lexical repetition. Large deviations can indicate templated text, translation,
 * obfuscation or watermarking.
 *
 * The reference distribution matches the detected language of the text
 * (English or French); diacritics are folded (é→e, ç→c, œ→oe) first.
 */
import type { StatisticalResult } from '@/types/analysis';
import { t } from '@/i18n';
import { detectLanguage, foldLetters, type ContentLanguage } from './language';

// Reference English letter frequencies (%), Norvig / Google Books corpus.
const ENGLISH: Record<string, number> = {
  e: 12.49, t: 9.28, a: 8.04, o: 7.64, i: 7.57, n: 7.23, s: 6.51, r: 6.28,
  h: 5.05, l: 4.07, d: 3.82, c: 3.34, u: 2.73, m: 2.51, f: 2.4, p: 2.14,
  g: 1.87, w: 1.68, y: 1.66, b: 1.48, v: 1.05, k: 0.54, x: 0.23, j: 0.16,
  q: 0.12, z: 0.09,
};

// Reference French letter frequencies (%), accents folded into the base
// letter (é/è/ê/ë→e, à/â→a, ç→c, î/ï→i, ô→o, ù/û→u). Source: Wikipedia
// "Letter frequency" (French corpus).
const FRENCH: Record<string, number> = {
  e: 16.72, a: 8.17, s: 7.95, i: 7.58, t: 7.24, n: 7.1, r: 6.69, u: 6.43,
  o: 5.82, l: 5.46, d: 3.67, c: 3.35, p: 3.02, m: 2.97, v: 1.84, q: 1.36,
  f: 1.07, b: 0.9, g: 0.87, h: 0.74, j: 0.61, x: 0.43, z: 0.33, y: 0.13,
  k: 0.07, w: 0.05,
};

const REFERENCE: Record<ContentLanguage, Record<string, number>> = { en: ENGLISH, fr: FRENCH };

const CHART_LETTERS: Record<ContentLanguage, string[]> = {
  en: ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'd', 'l', 'u'],
  fr: ['e', 'a', 's', 'i', 't', 'n', 'r', 'u', 'o', 'l', 'd', 'c'],
};

function shannonEntropy(counts: Map<string, number>, total: number): number {
  let h = 0;
  for (const c of counts.values()) {
    if (c === 0) continue;
    const p = c / total;
    h -= p * Math.log2(p);
  }
  return h;
}

// Lower regularised incomplete gamma via series / continued fraction, enough
// precision for a chi-square survival function.
function gammaP(s: number, x: number): number {
  if (x <= 0) return 0;
  if (x < s + 1) {
    let term = 1 / s;
    let sum = term;
    for (let n = 1; n < 200; n++) {
      term *= x / (s + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-12) break;
    }
    return sum * Math.exp(-x + s * Math.log(x) - lgamma(s));
  }
  // continued fraction for Q, then P = 1 - Q
  let b = x + 1 - s;
  let c = 1e300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 200; i++) {
    const an = -i * (i - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  const q = Math.exp(-x + s * Math.log(x) - lgamma(s)) * h;
  return 1 - q;
}

function lgamma(x: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function chiSquarePValue(chi2: number, df: number): number {
  return Math.max(0, Math.min(1, 1 - gammaP(df / 2, chi2 / 2)));
}

export function analyzeStatistics(text: string): StatisticalResult {
  const language = detectLanguage(text);
  const reference = REFERENCE[language];
  const letters = foldLetters(text).replace(/[^a-z]/g, '');
  const letterCount = letters.length;

  // Character-level entropy over the raw text.
  const charCounts = new Map<string, number>();
  for (const ch of text) charCounts.set(ch, (charCounts.get(ch) ?? 0) + 1);
  const entropy = text.length ? shannonEntropy(charCounts, text.length) : 0;

  // Letter frequency + chi-square vs the reference language.
  const obs = new Map<string, number>();
  for (const ch of letters) obs.set(ch, (obs.get(ch) ?? 0) + 1);

  let chi2 = 0;
  let absDeviation = 0;
  for (const [letter, expPct] of Object.entries(reference)) {
    const expected = (expPct / 100) * letterCount;
    const observed = obs.get(letter) ?? 0;
    if (expected >= 1) chi2 += ((observed - expected) ** 2) / expected;
    absDeviation += Math.abs(observed / Math.max(1, letterCount) - expPct / 100);
  }
  const frequencyDeviation = Number((absDeviation / 2).toFixed(4)); // total variation distance

  const df = 25;
  const threshold = 44.31; // chi-square critical value, df=25, p=0.01
  const pValue = letterCount >= 200 ? chiSquarePValue(chi2, df) : 1;

  // Lexical repetition (type-token ratio) as a secondary signal.
  const words = text.toLowerCase().match(/\b[\p{L}']+\b/gu) ?? [];
  const uniqueWords = new Set(words).size;
  const ttr = words.length ? uniqueWords / words.length : 1;

  // A transparent 0 to 10 "signal" heuristic. High deviation + unusually low or
  // high entropy + low lexical diversity push it up.
  const deviationScore = Math.min(6, frequencyDeviation * 60);
  const entropyPenalty = entropy > 0 && entropy < 3.2 ? 2 : entropy > 4.6 ? 1.5 : 0;
  const repetitionPenalty = words.length > 80 && ttr < 0.35 ? 2 : 0;
  const watermarkSignal = Number(
    Math.min(10, deviationScore + entropyPenalty + repetitionPenalty).toFixed(2),
  );

  let status: StatisticalResult['status'];
  let conclusion: string;
  const lang = t(`engine.languageName.${language}`);
  if (letterCount < 200) {
    status = 'inconclusive';
    conclusion = t('engine.statistics.tooShort');
  } else if (chi2 > threshold && pValue < 0.01) {
    status = 'possible';
    conclusion = t('engine.statistics.deviates', {
      lang, chi2: chi2.toFixed(1), p: pValue.toExponential(1),
    });
  } else {
    status = 'clean';
    conclusion = t('engine.statistics.consistent', {
      lang, chi2: chi2.toFixed(1), p: pValue.toFixed(2),
    });
  }

  const distribution = CHART_LETTERS[language].map((letter) => ({
    label: letter.toUpperCase(),
    observed: Number((((obs.get(letter) ?? 0) / Math.max(1, letterCount)) * 100).toFixed(2)),
    expected: reference[letter],
  }));

  return {
    status,
    observedScore: Number(chi2.toFixed(2)),
    threshold,
    pValue: Number(pValue.toExponential(2)),
    conclusion,
    entropy: Number(entropy.toFixed(2)),
    frequencyDeviation,
    watermarkSignal,
    distribution,
    language,
  };
}
