import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight,
  Upload, FileText, X, Download, Loader2, Copy, Check, ScanSearch,
  ClipboardPaste, Trash2,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Modal } from '@/components/ui/Modal';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';
import { useTranslation } from 'react-i18next';
import { cleanText, cleanFile, downloadBlob, type CleanFileResult } from '@/engine/clean';
import { historyApi } from '@/services';
import { ArtifactText } from '@/components/ui/ArtifactText';
import { countArtifacts } from '@/engine/unicode';
import { TEXT_LANGUAGES, isCodeLanguage, languageInfo } from '@/lib/textLanguages';

const supportedFormats = ['text', 'code', 'image', 'pdf', 'docx', 'audio', 'video'] as const;

type Tab = 'text' | 'file';

export default function Clean() {
  const [tab, setTab] = useState<Tab>('text');
  const { t } = useTranslation();
  // `null` = untouched → sample text (with hidden characters) in the UI language.
  const [draft, setText] = useState<string | null>(null);
  const text = draft ?? t('clean.sample');
  const [ops, setOps] = useState({ unicode: true, trimWhitespace: true, normalizeNewlines: false });

  const [language, setLanguage] = useState('plaintext');
  const [file, setFileState] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textResult, setTextResult] = useState<ReturnType<typeof cleanText> | null>(null);
  const [imageResult, setImageResult] = useState<CleanFileResult | null>(null);
  const [copied, setCopied] = useState(false);

  const setFile = (f: File | null) => { setFileState(f); setImageResult(null); setError(null); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lang = languageInfo(language);
  const cleanedName = `cleaned.${lang.ext}`;

  const copyCleaned = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (insecure context): the download remains */
    }
  };

  const toggle = (k: keyof typeof ops) => setOps((o) => ({ ...o, [k]: !o[k] }));


  const previewText = tab === 'text' ? cleanText(text, ops, language) : null;
  const artifactCount = tab === 'text' ? countArtifacts(text) : 0;

  const runClean = async () => {
    setError(null);
    if (tab === 'text') {
      setBusy(true);
      const r = cleanText(text, ops, language);
      setTextResult(r);
      setText(r.text);
      setBusy(false);
      void historyApi.recordCleaning({
        name: t('history.cleanedText', { count: Array.from(text).length }),
        type: isCodeLanguage(language) ? 'code' : 'text',
        removed: r.removed,
        beforeSize: r.beforeSize,
        afterSize: r.afterSize,
        lossless: true,
      });
      return;
    }
    if (!file) return;
    setBusy(true);
    try {
      const r = await cleanFile(file);
      setImageResult(r);
      void historyApi.recordCleaning({
        name: file.name,
        type: r.type,
        removed: r.removed,
        beforeSize: r.beforeSize,
        afterSize: r.afterSize,
        lossless: r.lossless,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('clean.failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t('clean.title')}</h1>
          <p className="mt-1 text-muted">{t('clean.subtitle')}</p>
        </div>

        <div className="flex gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted">{t('clean.warning')}</p>
        </div>

        <div className="flex gap-1 p-1 bg-surface-2 rounded-lg w-fit mb-6">
          {(['text', 'file'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${tab === key ? 'text-content' : 'text-muted'}`}
            >
              <span className="flex items-center gap-2">
                {key === 'text' ? <FileText className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                {key === 'text' ? t('common.text') : t('common.file')}
              </span>
              {tab === key && (
                <motion.div
                  layoutId="clean-tab-indicator"
                  className="absolute inset-0 bg-surface rounded-md -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20">
            <AlertTriangle className="h-4 w-4 text-error shrink-0" />
            <span className="text-sm text-error">{error}</span>
          </div>
        )}

        {tab === 'text' ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => { setLanguage(e.target.value); setTextResult(null); }}
                  aria-label={t('clean.languageLabel')}
                  className="text-sm bg-surface-2 border border-default rounded-lg px-3 py-1.5 text-content focus:outline-none focus:border-primary"
                >
                  {TEXT_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>{l.label ?? t('analyze.plainText')}</option>
                  ))}
                </select>
                <span className="text-xs text-subtle">{t('analyze.counts', { chars: charCount, words: wordCount })}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      setText(await navigator.clipboard.readText());
                      setTextResult(null);
                    } catch { /* clipboard unavailable */ }
                  }}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-content px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  {t('analyze.paste')}
                </button>
                <button
                  onClick={() => { setText(''); setTextResult(null); }}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-content px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('analyze.clear')}
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setTextResult(null); }}
              aria-label={t('clean.inputLabel')}
              placeholder={t('analyze.placeholder')}
              className="w-full h-48 bg-surface border border-default rounded-lg p-4 text-sm font-mono text-content resize-none focus:outline-none focus:border-primary mb-3"
            />

            {/* Live view of what the cleaner will remove or replace. */}
            <div className={`mb-4 rounded-lg border p-4 ${artifactCount ? 'border-warning/30 bg-warning/5' : 'border-success/20 bg-success/5'}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                {artifactCount ? (
                  <ScanSearch className="h-4 w-4 shrink-0 text-warning" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                )}
                <span className={artifactCount ? 'text-warning' : 'text-success'}>
                  {artifactCount ? t('clean.detected', { count: artifactCount }) : t('clean.noneDetected')}
                </span>
              </div>
              {artifactCount > 0 && (
                <>
                  <ArtifactText text={text} className="max-h-40 overflow-auto text-muted" />
                  <p className="mt-2 text-xs text-subtle">{t('clean.legend')}</p>
                </>
              )}
            </div>
            <div className="space-y-3 mb-6">
              <OpToggle label={t('clean.ops.unicode')} desc={t('clean.ops.unicodeDesc')} on={ops.unicode} onClick={() => toggle('unicode')} risk="safe" />
              <OpToggle label={t('clean.ops.trim')} desc={t('clean.ops.trimDesc')} on={ops.trimWhitespace} onClick={() => toggle('trimWhitespace')} risk="safe" />
              <OpToggle label={t('clean.ops.newlines')} desc={t('clean.ops.newlinesDesc')} on={ops.normalizeNewlines} onClick={() => toggle('normalizeNewlines')} risk="safe" />
            </div>
          </>
        ) : (
          <div className="mb-6">
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                  dragging ? 'border-primary bg-primary/5' : 'border-border-hover hover:border-primary/50'
                }`}
              >
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
                <div className="p-4 rounded-2xl bg-surface-2 text-primary w-fit mx-auto mb-4">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">{t('analyze.drop')}</h3>
                <p className="mt-1 text-sm text-muted">{t('analyze.browse')}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {supportedFormats.map((fmt) => (
                    <span key={fmt} className="px-2 py-1 rounded-md bg-surface-2 border border-default text-xs text-muted">
                      {t(`status.type.${fmt}`).toUpperCase()}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-subtle">{t('clean.dropDesc')}</p>
              </div>
            ) : (
              <div className="surface p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">{file.name}</p>
                    <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB · {file.type || t('analyze.unknownType')}</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 rounded-lg hover:bg-surface-2 text-muted" aria-label={t('analyze.removeFile')}><X className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <PrivacyBadge label={t('clean.local')} />
          <div className="flex gap-3 sm:ml-auto">
            {tab === 'text' && (
              <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-default text-sm font-medium hover:bg-surface-2 transition-colors">
                {t('clean.preview')}
              </button>
            )}
            <button
              onClick={runClean}
              disabled={busy || (tab === 'file' && !file)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {t('clean.run')}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {textResult && tab === 'text' && (
            <ResultCard removed={textResult.removed} before={textResult.beforeSize} after={textResult.afterSize}>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void copyCleaned(textResult.text)} className="btn-download">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? t('clean.copied') : t('clean.copy')}
                </button>
                <button onClick={() => downloadBlob(new Blob([textResult.text], { type: lang.mime }), cleanedName)} className="btn-download">
                  <Download className="h-4 w-4" /> {t('clean.download', { name: cleanedName })}
                </button>
              </div>
            </ResultCard>
          )}
          {imageResult && tab === 'file' && (
            <ResultCard removed={imageResult.removed} before={imageResult.beforeSize} after={imageResult.afterSize}>
              {imageResult.type !== 'text' && imageResult.type !== 'code' && (
                <p className={`mb-3 text-xs ${imageResult.lossless ? 'text-success' : 'text-warning'}`}>
                  {imageResult.lossless ? t('clean.lossless') : t('clean.reencoded')}
                </p>
              )}
              <button onClick={() => downloadBlob(imageResult.blob, imageResult.filename)} className="btn-download">
                <Download className="h-4 w-4" /> {t('clean.download', { name: imageResult.filename })}
              </button>
            </ResultCard>
          )}
        </AnimatePresence>
      </div>

      <Modal open={showPreview} onClose={() => setShowPreview(false)} title={t('clean.previewTitle')} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {previewText?.removed.filter((r) => r.count > 0).map((r) => `${r.count} ${r.type.toLowerCase()}`).join(' · ') || t('clean.noChanges')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2"><ArrowLeft className="h-4 w-4 text-muted" /><span className="text-sm font-semibold">{t('clean.before')}</span></div>
              <ArtifactText text={text} className="surface-2 p-4 rounded-lg text-muted max-h-48 overflow-auto" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><ArrowRight className="h-4 w-4 text-success" /><span className="text-sm font-semibold text-success">{t('clean.after')}</span></div>
              <ArtifactText text={previewText?.text ?? ''} className="surface-2 p-4 rounded-lg text-content max-h-48 overflow-auto" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowPreview(false)} className="px-4 py-2 rounded-lg border border-default text-sm font-medium hover:bg-surface-2">{t('common.close')}</button>
            <button onClick={() => { setShowPreview(false); void runClean(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover">
              <Sparkles className="h-4 w-4" /> {t('clean.apply')}
            </button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}

function OpToggle({ label, desc, on, onClick, risk }: { label: string; desc: string; on: boolean; onClick: () => void; risk: 'safe' | 'warning' }) {
  const { t } = useTranslation();
  return (
    <div className="surface p-4 flex items-start gap-4">
      <button
        onClick={onClick}
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 mt-0.5 ${on ? 'bg-primary' : 'bg-border-hover'}`}
      >
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-0.5 h-5 w-5 rounded-full bg-white" style={{ left: on ? '1.375rem' : '0.125rem' }} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold">{label}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk === 'safe' ? 'bg-success/10 border border-success/20 text-success' : 'bg-warning/10 border border-warning/20 text-warning'}`}>
            {t(`clean.risk.${risk}`).toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-muted mt-1">{desc}</p>
      </div>
    </div>
  );
}

function ResultCard({ removed, before, after, children }: { removed: { type: string; count: number }[]; before: number; after: number; children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 surface p-5 border-success/20">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="h-5 w-5 text-success" />
        <h3 className="font-semibold text-success">{t('clean.done')}</h3>
      </div>
      <ul className="space-y-1 text-sm text-muted mb-3">
        {removed.filter((r) => r.count > 0).map((r) => <li key={r.type}>· {r.count} × {r.type}</li>)}
        {removed.every((r) => r.count === 0) && <li>· {t('clean.nothing')}</li>}
      </ul>
      <p className="text-xs text-subtle mb-4">{(before / 1024).toFixed(1)} KB → {(after / 1024).toFixed(1)} KB</p>
      {children}
    </motion.div>
  );
}
