import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight,
  Upload, FileText, X, Download, Loader2, Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { Modal } from '@/components/ui/Modal';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';
import { cleanText, cleanImage, downloadBlob, type CleanImageResult } from '@/engine/clean';
import { useQuotaStore } from '@/stores/useQuotaStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { can } from '@/lib/plans';

const sampleText =
  'The rapid​ advancement of machine‍ learning models has⁠ transformed how we interact with digital content.   \nUnderstanding the provenance of information is essential.';

type Tab = 'text' | 'file';

export default function Clean() {
  const plan = useAuthStore((s) => s.plan);
  const consume = useQuotaStore((s) => s.consume);

  const [tab, setTab] = useState<Tab>('text');
  const [text, setText] = useState(sampleText);
  const [ops, setOps] = useState({ unicode: true, trimWhitespace: true, normalizeNewlines: false });

  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textResult, setTextResult] = useState<ReturnType<typeof cleanText> | null>(null);
  const [imageResult, setImageResult] = useState<CleanImageResult | null>(null);

  const toggle = (k: keyof typeof ops) => setOps((o) => ({ ...o, [k]: !o[k] }));

  const isImage = file && /\.(png|jpe?g|webp|gif|avif|heic)$/i.test(file.name);
  const isDoc = file && /\.(pdf|docx?|wav|mp3|flac|ogg|m4a)$/i.test(file.name);
  const docBlocked = isDoc && !can(plan, 'clean_documents');

  const previewText = tab === 'text' ? cleanText(text, ops) : null;

  const runClean = async () => {
    setError(null);
    if (tab === 'text') {
      if (!(await consume('clean'))) return;
      setBusy(true);
      const r = cleanText(text, ops);
      setTextResult(r);
      setText(r.text);
      setBusy(false);
      return;
    }
    if (!file) return;
    if (docBlocked) {
      setError('Cleaning PDF, DOCX and audio files requires the Pro plan.');
      return;
    }
    if (!isImage) {
      setError('This file type cannot be cleaned in the browser yet.');
      return;
    }
    if (!(await consume('clean'))) return;
    setBusy(true);
    try {
      const r = await cleanImage(file);
      setImageResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cleaning failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Clean content</h1>
          <p className="mt-1 text-muted">Strip invisible characters and embedded metadata — locally, then download.</p>
        </div>

        <div className="flex gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted">
            Removing metadata permanently discards information about the content's origin (EXIF,
            XMP, C2PA Content Credentials). This cannot be undone on the cleaned copy.
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-surface-2 rounded-lg w-fit mb-6">
          {(['text', 'file'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === t ? 'bg-surface text-content' : 'text-muted'}`}>
              <span className="flex items-center gap-2">{t === 'text' ? <FileText className="h-4 w-4" /> : <Upload className="h-4 w-4" />}{t === 'text' ? 'Text' : 'File'}</span>
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
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setTextResult(null); }}
              className="w-full h-48 bg-surface border border-default rounded-lg p-4 text-sm font-mono text-content resize-none focus:outline-none focus:border-primary mb-4"
            />
            <div className="space-y-3 mb-6">
              <OpToggle label="Remove invisible Unicode" desc="Zero-width spaces, joiners, tag chars, bidi overrides, homoglyphs." on={ops.unicode} onClick={() => toggle('unicode')} risk="safe" />
              <OpToggle label="Trim trailing whitespace" desc="Remove trailing spaces/tabs and collapse blank-line runs." on={ops.trimWhitespace} onClick={() => toggle('trimWhitespace')} risk="safe" />
              <OpToggle label="Normalise line endings to LF" desc="Convert CRLF / CR to LF." on={ops.normalizeNewlines} onClick={() => toggle('normalizeNewlines')} risk="safe" />
            </div>
          </>
        ) : (
          <div className="mb-6">
            {!file ? (
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border-hover hover:border-primary/50 rounded-xl p-10 text-center cursor-pointer transition-colors">
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setImageResult(null); }} />
                <Upload className="h-8 w-8 mx-auto text-primary mb-3" />
                <h3 className="font-semibold">Drop a file to clean</h3>
                <p className="text-sm text-muted mt-1">Images: full metadata strip. {can(plan, 'clean_documents') ? 'PDF/DOCX/audio supported.' : 'PDF/DOCX/audio need Pro.'}</p>
              </div>
            ) : (
              <div className="surface p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">{file.name}</p>
                    <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setImageResult(null); }} className="p-2 rounded-lg hover:bg-surface-2 text-muted"><X className="h-4 w-4" /></button>
              </div>
            )}
            {docBlocked && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-surface-2 border border-default text-sm text-muted">
                <Lock className="h-4 w-4 text-primary" />
                Cleaning this file type is a <Link to="/pricing" className="text-primary">Pro</Link> feature.
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <PrivacyBadge label="Everything happens in your browser" />
          <div className="flex gap-3 sm:ml-auto">
            {tab === 'text' && (
              <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-default text-sm font-medium hover:bg-surface-2 transition-colors">
                Preview
              </button>
            )}
            <button
              onClick={runClean}
              disabled={busy || (tab === 'file' && !file)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Clean
            </button>
          </div>
        </div>

        <AnimatePresence>
          {textResult && tab === 'text' && (
            <ResultCard removed={textResult.removed} before={textResult.beforeSize} after={textResult.afterSize}>
              <button onClick={() => downloadBlob(new Blob([textResult.text], { type: 'text/plain' }), 'cleaned.txt')} className="btn-download">
                <Download className="h-4 w-4" /> Download cleaned.txt
              </button>
            </ResultCard>
          )}
          {imageResult && tab === 'file' && (
            <ResultCard removed={imageResult.removed} before={imageResult.beforeSize} after={imageResult.afterSize}>
              <button onClick={() => downloadBlob(imageResult.blob, imageResult.filename)} className="btn-download">
                <Download className="h-4 w-4" /> Download {imageResult.filename}
              </button>
            </ResultCard>
          )}
        </AnimatePresence>
      </div>

      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Preview changes" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {previewText?.removed.filter((r) => r.count > 0).map((r) => `${r.count} ${r.type.toLowerCase()}`).join(' · ') || 'No changes with the current options.'}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2"><ArrowLeft className="h-4 w-4 text-muted" /><span className="text-sm font-semibold">Before</span></div>
              <pre className="surface-2 p-4 rounded-lg font-mono text-xs text-muted max-h-48 overflow-auto whitespace-pre-wrap">{JSON.stringify(text).slice(1, -1)}</pre>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><ArrowRight className="h-4 w-4 text-success" /><span className="text-sm font-semibold text-success">After</span></div>
              <pre className="surface-2 p-4 rounded-lg font-mono text-xs text-content max-h-48 overflow-auto whitespace-pre-wrap">{previewText ? JSON.stringify(previewText.text).slice(1, -1) : ''}</pre>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowPreview(false)} className="px-4 py-2 rounded-lg border border-default text-sm font-medium hover:bg-surface-2">Close</button>
            <button onClick={() => { setShowPreview(false); void runClean(); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover">
              <Sparkles className="h-4 w-4" /> Apply
            </button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}

function OpToggle({ label, desc, on, onClick, risk }: { label: string; desc: string; on: boolean; onClick: () => void; risk: 'safe' | 'warning' }) {
  return (
    <div className="surface p-4 flex items-start gap-4">
      <button onClick={onClick} className={`relative h-6 w-11 rounded-full transition-colors shrink-0 mt-0.5 ${on ? 'bg-primary' : 'bg-border-hover'}`}>
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-0.5 h-5 w-5 rounded-full bg-white" style={{ left: on ? '1.375rem' : '0.125rem' }} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold">{label}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk === 'safe' ? 'bg-success/10 border border-success/20 text-success' : 'bg-warning/10 border border-warning/20 text-warning'}`}>
            {risk.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-muted mt-1">{desc}</p>
      </div>
    </div>
  );
}

function ResultCard({ removed, before, after, children }: { removed: { type: string; count: number }[]; before: number; after: number; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 surface p-5 border-success/20">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="h-5 w-5 text-success" />
        <h3 className="font-semibold text-success">Cleaned</h3>
      </div>
      <ul className="space-y-1 text-sm text-muted mb-3">
        {removed.filter((r) => r.count > 0).map((r) => <li key={r.type}>· {r.count} — {r.type}</li>)}
        {removed.every((r) => r.count === 0) && <li>· No detectable artifacts were present.</li>}
      </ul>
      <p className="text-xs text-subtle mb-4">{(before / 1024).toFixed(1)} KB → {(after / 1024).toFixed(1)} KB</p>
      {children}
    </motion.div>
  );
}
