import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { clean } from '@/i18n/locales/en/tools';
import { classifyChar, describeArtifact, type ArtifactKind } from '@/engine/unicode';

// Short, language-neutral markers for characters that have no visible glyph.
const MARKER: Record<Exclude<ArtifactKind, 'homoglyph'>, string> = {
  tag: 'TAG',
  zeroWidth: 'ZW',
  space: 'SP',
  bidi: 'BIDI',
  c0: 'CTRL',
  c1: 'CTRL',
  variation: 'VS',
};

/**
 * Renders text with every invisible / suspicious character made visible:
 * a small marker chip for glyph-less characters, a red underline for
 * homoglyphs. Hover (or long-press) shows what the character is.
 */
export function ArtifactText({ text, className = '' }: { text: string; className?: string }) {
  const chars = Array.from(text);
  return (
    <div className={`whitespace-pre-wrap break-words font-mono text-xs leading-relaxed ${className}`}>
      {chars.map((ch, i) => {
        const a = classifyChar(chars, i);
        if (!a) return <Fragment key={i}>{ch}</Fragment>;
        const title = `${describeArtifact(a)} (U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')})`;
        if (a.kind === 'homoglyph') {
          return (
            <mark key={i} title={title} className="rounded-sm bg-error/20 text-error underline decoration-error decoration-2 underline-offset-2">
              {ch}
            </mark>
          );
        }
        return (
          <span
            key={i}
            title={title}
            className="mx-px inline-block rounded border border-warning/40 bg-warning/15 px-1 align-middle text-[9px] font-semibold leading-4 text-warning"
          >
            {MARKER[a.kind]}
          </span>
        );
      })}
    </div>
  );
}

// Characters that get their own name in the key (see `clean.charNames`).
const NAMED = new Set(['u200b', 'u200c', 'u200d', 'u2060', 'ufeff', 'u00ad', 'u180e', 'u200e', 'u200f', 'u202a', 'u202b', 'u202c', 'u202d', 'u202e', 'u2066', 'u2067', 'u2068', 'u2069', 'u3000', 'u2003', 'u2002', 'u205f']);

const codePoint = (ch: string) => `U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;

/**
 * Plain-language key for the markers of `ArtifactText`: one line per kind of
 * character found, with what it is and how many times it occurs. Readable on
 * touch screens, where there is no hover.
 */
export function ArtifactLegend({ text }: { text: string }) {
  const { t } = useTranslation();
  const name = (ch: string, a: NonNullable<ReturnType<typeof classifyChar>>) => {
    const key = `u${ch.codePointAt(0)!.toString(16).padStart(4, '0')}` as keyof typeof clean.charNames;
    return a.kind !== 'homoglyph' && NAMED.has(key) ? t(`clean.charNames.${key}`) : describeArtifact(a);
  };
  const chars = Array.from(text);
  const groups = new Map<string, { ch: string; artifact: NonNullable<ReturnType<typeof classifyChar>>; count: number }>();
  chars.forEach((ch, i) => {
    const a = classifyChar(chars, i);
    if (!a) return;
    const key = `${a.kind}:${ch}`;
    const g = groups.get(key);
    if (g) g.count++;
    else groups.set(key, { ch, artifact: a, count: 1 });
  });
  if (!groups.size) return null;
  return (
    <ul className="space-y-1.5">
      {[...groups.values()].map(({ ch, artifact, count }) => (
        <li key={`${artifact.kind}:${ch}`} className="flex items-center gap-2 text-xs">
          <span className="flex w-12 shrink-0 justify-center">
            {artifact.kind === 'homoglyph' ? (
              <mark className="rounded-sm bg-error/20 px-1 font-mono text-error underline decoration-error decoration-2 underline-offset-2">{ch}</mark>
            ) : (
              <span className="rounded border border-warning/40 bg-warning/15 px-1 font-mono text-[9px] font-semibold leading-4 text-warning">
                {MARKER[artifact.kind]}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1 text-muted">
            {name(ch, artifact)} <span className="font-mono text-subtle">({codePoint(ch)})</span>
          </span>
          <span className="shrink-0 tabular-nums text-subtle">× {count}</span>
        </li>
      ))}
    </ul>
  );
}
