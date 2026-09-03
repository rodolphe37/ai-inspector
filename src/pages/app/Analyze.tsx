import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FileText, Upload, X, CheckCircle2, Lock, Eye,
  ClipboardPaste, Trash2, Loader2,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { PrivacyBadge } from '@/components/ui/PrivacyBadge';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { analysisApi } from '@/services';

const sampleText = `The rapid advancement of machine learning models has transformed how we interact with digital content. Understanding the provenance of information is essential for maintaining trust in media ecosystems.

Provenance signals, metadata, and watermark detection provide a technical foundation for content attribution that does not rely on fallible AI classifiers. By examining Unicode characters, metadata fields, C2PA manifests, and statistical distributions, we can build a transparent picture of a piece of content's history.`;

const supportedFormats = ['TXT', 'MD', 'JSON', 'JS', 'TS', 'PY', 'HTML', 'CSS', 'PDF', 'DOCX', 'PNG', 'JPG', 'WEBP', 'WAV', 'MP3'];

const analysisSteps = [
  { label: 'Normalizing', icon: FileText },
  { label: 'Unicode inspection', icon: Eye },
  { label: 'Metadata inspection', icon: FileText },
  { label: 'Provenance inspection', icon: Lock },
  { label: 'Fingerprint matching', icon: Search },
  { label: 'Statistical analysis', icon: FileText },
  { label: 'Building report', icon: FileText },
];

export default function Analyze() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [text, setText] = useState(sampleText);
  const [language, setLanguage] = useState('plaintext');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { startAnalysis } = useAnalysisStore();

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setCurrentStep(0);
    startAnalysis();

    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 400));
    }

    let result;
    if (mode === 'text' && text) {
      result = await analysisApi.analyzeText(text, language);
    } else if (mode === 'file' && file) {
      result = await analysisApi.analyzeFile(file);
    } else {
      result = await analysisApi.analyzeText(sampleText);
    }

    setAnalyzing(false);
    setCurrentStep(-1);
    navigate(`/app/results/${result.id}`);
  };

  const canAnalyze = mode === 'text' ? text.trim().length > 0 : file !== null;

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Analyze content</h1>
          <p className="mt-1 text-muted">Inspect text or files for known provenance signals.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-2 rounded-lg w-fit mb-6">
          {(['text', 'file'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className="relative px-4 py-2 text-sm font-medium transition-colors"
            >
              {tab === 'text' ? (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  File
                </span>
              )}
              {mode === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-surface rounded-md -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'text' ? (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-sm bg-surface-2 border border-default rounded-lg px-3 py-1.5 text-content focus:outline-none focus:border-primary"
                  >
                    <option value="plaintext">Plain text</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="markdown">Markdown</option>
                    <option value="json">JSON</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
                  <span className="text-xs text-subtle">{charCount} chars · {wordCount} words</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const clipText = await navigator.clipboard.readText();
                        setText(clipText);
                      } catch { /* clipboard not available */ }
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-content px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                    Paste
                  </button>
                  <button
                    onClick={() => setText('')}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-content px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Editor */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-80 bg-surface border border-default rounded-lg p-4 text-sm font-mono text-content resize-none focus:outline-none focus:border-primary transition-colors"
                placeholder="Paste or type content to analyze..."
              />

              <div className="mt-3 flex items-center justify-between">
                <PrivacyBadge label="Processing locally in demo mode" />
                <button
                  onClick={runAnalysis}
                  disabled={!canAnalyze || analyzing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="h-4 w-4" />
                  Analyze
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    dragging ? 'border-primary bg-primary/5' : 'border-border-hover hover:border-primary/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="p-4 rounded-2xl bg-surface-2 text-primary w-fit mx-auto mb-4">
                    <Upload className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">Drop your file here</h3>
                  <p className="mt-1 text-sm text-muted">or click to browse</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {supportedFormats.map((fmt) => (
                      <span key={fmt} className="px-2 py-1 rounded-md bg-surface-2 border border-default text-xs text-muted">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted">
                          {(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="p-2 rounded-lg hover:bg-surface-2 text-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>File ready for analysis</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <PrivacyBadge label="File processed locally in demo mode" />
                    <button
                      onClick={runAnalysis}
                      disabled={analyzing}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      <Search className="h-4 w-4" />
                      Analyze
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis overlay */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="surface p-8 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <h2 className="text-lg font-semibold">Analyzing content</h2>
                </div>
                <div className="space-y-3">
                  {analysisSteps.map((step, i) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: i <= currentStep ? 1 : 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium ${
                        i < currentStep
                          ? 'bg-success/20 text-success'
                          : i === currentStep
                            ? 'bg-primary/20 text-primary'
                            : 'bg-surface-2 text-subtle'
                      }`}>
                        {i < currentStep ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : i === currentStep ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span>{String(i + 1).padStart(2, '0')}</span>
                        )}
                      </div>
                      <span className={`text-sm ${i <= currentStep ? 'text-content' : 'text-subtle'}`}>
                        {String(i + 1).padStart(2, '0')} {step.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
