/**
 * AI-generated code estimator.
 *
 * Source code has a different tell-set from prose. Assistant-generated code
 * tends to be:
 *  - heavily and uniformly commented (a comment restating almost every line,
 *    a docstring on every function, even trivial ones)
 *  - free of dead code, commented-out experiments, personal TODO/HACK notes
 *  - perfectly consistent (indentation, quote style, naming convention)
 *  - defensively verbose (try/except around everything, exhaustive validation)
 *  - full of generic identifiers (data, result, item, process_data, handle_x)
 *  - occasionally carrying leftover chat scaffolding ("Here's the…", "// ... rest
 *    of the code", "# Example usage:", placeholder keys)
 *
 * Same contract as `analyzeTextAi`. An ESTIMATE: refactored, formatted or
 * linted human code trips several of these, and short snippets are unreliable.
 */
import type { TextAiResult, TextAiSignal } from './aiText';
import { t } from '@/i18n';

const LEFTOVER_MARKERS = [
  "here's the", 'here is the', 'certainly!', 'sure!', "i've ", 'i have added',
  'as requested', 'as an ai', 'rest of the code', 'rest of your code',
  'your code here', 'implementation goes here', 'add your logic here',
  '# example usage', '// example usage', 'replace with your', '<your-', 'your-api-key',
  'this is a simplified', 'for brevity', 'note: this', '# note:', '// note:',
  'feel free to', 'let me know if', 'hope this helps',
];

const GENERIC_IDENT = [
  'data', 'result', 'results', 'item', 'items', 'temp', 'tmp', 'value', 'values',
  'obj', 'arr', 'res', 'req', 'ctx', 'process_data', 'handle_request', 'do_stuff',
  'my_function', 'my_func', 'helper', 'utils', 'main_function',
];

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function commentLines(lines: string[]): number {
  return lines.filter((l) => /^\s*(#|\/\/|\*|--|;)/.test(l) || /^\s*\/\*/.test(l)).length;
}

export function analyzeCodeAi(code: string, _language?: string): TextAiResult {
  const src = code.replace(/\r\n/g, '\n');
  const lines = src.split('\n');
  const codeLines = lines.filter((l) => l.trim().length > 0);
  const loc = codeLines.length;

  if (loc < 12) {
    return { probability: 0, signals: [], reliable: false };
  }

  const lower = src.toLowerCase();
  const signals: TextAiSignal[] = [];

  // 1. Comment density.
  const comments = commentLines(lines);
  const commentRatio = comments / Math.max(1, codeLines.length);
  const sComments = sigmoid((commentRatio - 0.28) * 12);
  signals.push({
    label: t('engine.code.comments'),
    detail: t('engine.code.commentsDetail', { value: Math.round(commentRatio * 100) }),
    weight: sComments,
  });

  // 2. Explanatory comments restating the code.
  const explanatory = (
    src.match(/(?:#|\/\/)\s*(?:this|here|now|we|the following|loop through|iterate|initialize|define|create|check if|return the|set the)\b/gi) ?? []
  ).length;
  const explRate = (explanatory / Math.max(1, comments || 1));
  const sExpl = sigmoid((explRate - 0.35) * 5);
  signals.push({
    label: t('engine.code.tutorial'),
    detail: t('engine.code.tutorialDetail', { count: explanatory }),
    weight: sExpl * 0.8,
  });

  // 3. Docstring on (nearly) every function.
  const funcs = (src.match(/\b(def |function |func |const \w+ = \(|=>\s*{)/g) ?? []).length;
  const docstrings = (src.match(/"""[\s\S]*?"""|'''[\s\S]*?'''|\/\*\*[\s\S]*?\*\//g) ?? []).length;
  if (funcs >= 2) {
    const docRatio = docstrings / funcs;
    signals.push({
      label: t('engine.code.docstrings'),
      detail: t('engine.code.docstringsDetail', { docs: docstrings, funcs }),
      weight: sigmoid((docRatio - 0.7) * 5) * 0.7,
    });
  }

  // 4. Absence of dead / commented-out code and personal notes.
  const deadCode = (src.match(/(?:#|\/\/)\s*(?:console\.|print\(|return |if |for |[a-z_]+\s*=)/gi) ?? []).length;
  const personalNotes = (src.match(/\b(TODO|FIXME|HACK|XXX|WTF|NOTE\s*TO\s*SELF)\b/g) ?? []).length;
  if (comments >= 4 && deadCode === 0 && personalNotes === 0) {
    signals.push({
      label: t('engine.code.tidy'),
      detail: t('engine.code.tidyDetail'),
      weight: 0.45,
    });
  }

  // 5. Formatting perfectly consistent.
  const indented = codeLines.filter((l) => /^[ \t]/.test(l));
  const usesTab = indented.filter((l) => l.startsWith('\t')).length;
  const usesSpace = indented.filter((l) => l.startsWith(' ')).length;
  const mixedIndent = usesTab > 0 && usesSpace > 0;
  const dquote = (src.match(/"/g) ?? []).length;
  const squote = (src.match(/'/g) ?? []).length;
  const quoteConsistent = dquote === 0 || squote === 0 || Math.max(dquote, squote) / (dquote + squote) > 0.9;
  const trailingWs = lines.filter((l) => /[ \t]+$/.test(l)).length;
  if (!mixedIndent && quoteConsistent && trailingWs === 0 && loc > 25) {
    signals.push({
      label: t('engine.code.formatting'),
      detail: t('engine.code.formattingDetail'),
      weight: 0.3,
    });
  }

  // 6. Leftover chat scaffolding.
  const leftovers = LEFTOVER_MARKERS.filter((m) => lower.includes(m));
  if (leftovers.length) {
    signals.push({
      label: t('engine.code.scaffolding'),
      detail: t('engine.code.scaffoldingDetail', { items: leftovers.slice(0, 3).join(', ') }),
      weight: Math.min(0.95, 0.55 + leftovers.length * 0.15),
    });
  }

  // 7. Generic identifier names.
  const idents = src.match(/\b[a-z_][a-z0-9_]*\b/gi) ?? [];
  const genericHits = idents.filter((w) => GENERIC_IDENT.includes(w.toLowerCase())).length;
  const genericRate = (genericHits / Math.max(1, idents.length)) * 100;
  if (genericRate > 3) {
    signals.push({
      label: t('engine.code.generic'),
      detail: t('engine.code.genericDetail', { value: genericRate.toFixed(1) }),
      weight: sigmoid((genericRate - 4) * 0.7) * 0.6,
    });
  }

  const active = signals.filter((s) => s.weight > 0.05);
  const total = active.reduce((a, s) => a + s.weight, 0);
  const maxTotal = 1 + 0.8 + 0.7 + 0.45 + 0.3 + 0.95 + 0.6;
  const raw = sigmoid((total / maxTotal - 0.3) * 7);
  const probability = Math.round(Math.min(95, Math.max(3, raw * 100)));

  return {
    probability,
    signals: active.sort((a, b) => b.weight - a.weight),
    reliable: loc >= 30,
  };
}
