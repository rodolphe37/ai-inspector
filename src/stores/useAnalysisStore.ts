import { create } from 'zustand';
import type { AnalysisResult, AnalysisStep } from '@/types/analysis';

interface AnalysisState {
  isAnalyzing: boolean;
  currentStep: number;
  steps: AnalysisStep[];
  result: AnalysisResult | null;
  error: string | null;
  startAnalysis: () => void;
  setStep: (index: number, status: AnalysisStep['status']) => void;
  setResult: (result: AnalysisResult) => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

const defaultSteps: AnalysisStep[] = [
  { id: 1, label: 'Normalizing', status: 'pending' },
  { id: 2, label: 'Unicode inspection', status: 'pending' },
  { id: 3, label: 'Metadata inspection', status: 'pending' },
  { id: 4, label: 'Provenance inspection', status: 'pending' },
  { id: 5, label: 'Fingerprint matching', status: 'pending' },
  { id: 6, label: 'Statistical analysis', status: 'pending' },
  { id: 7, label: 'Building report', status: 'pending' },
];

export const useAnalysisStore = create<AnalysisState>((set) => ({
  isAnalyzing: false,
  currentStep: 0,
  steps: defaultSteps,
  result: null,
  error: null,
  startAnalysis: () =>
    set({
      isAnalyzing: true,
      currentStep: 0,
      steps: defaultSteps.map((s) => ({ ...s, status: 'pending' as const })),
      result: null,
      error: null,
    }),
  setStep: (index, status) =>
    set((state) => ({
      currentStep: index,
      steps: state.steps.map((s, i) => (i === index ? { ...s, status } : s)),
    })),
  setResult: (result) => set({ result, isAnalyzing: false }),
  setError: (error) => set({ error, isAnalyzing: false }),
  reset: () =>
    set({
      isAnalyzing: false,
      currentStep: 0,
      steps: defaultSteps,
      result: null,
      error: null,
    }),
}));
