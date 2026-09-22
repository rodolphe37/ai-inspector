import { Fragment } from 'react';
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
