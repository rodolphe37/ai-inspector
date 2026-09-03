import type { AnalysisApi } from '@/types/api';
import type { AnalysisResult, CleanResult } from '@/types/analysis';
import mockResultsData from '@/data/mockResults.json';
import mockAnalysesData from '@/data/mockAnalyses.json';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generateId(): string {
  return `analysis_${Date.now().toString(36)}`;
}

function buildResult(name: string, type: string, content: string): AnalysisResult {
  const base = mockResultsData as unknown as AnalysisResult;
  const hasContent = content.length > 0;
  const charCount = content.length;

  return {
    ...base,
    id: generateId(),
    name,
    type: type as AnalysisResult['type'],
    date: new Date().toISOString(),
    isDemo: true,
    summary: hasContent
      ? base.summary
      : 'Content was analyzed in demo mode. Results are simulated and do not reflect real analysis.',
    unicode: {
      ...base.unicode,
      invisibleCharacters: 0,
      controlCharacters: 0,
      homoglyphs: 0,
    },
    metadata: {
      ...base.metadata,
      entries: [
        ...base.metadata.entries,
        { key: 'Character count', value: charCount.toString() },
      ],
    },
  };
}

export const mockAnalysisApi: AnalysisApi = {
  async analyzeText(input: string, _language = 'plaintext'): Promise<AnalysisResult> {
    await delay(1200);
    return buildResult('pasted-content.txt', 'text', input);
  },

  async analyzeFile(file: File): Promise<AnalysisResult> {
    await delay(1500);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    const type = ['png', 'jpg', 'jpeg', 'webp'].includes(ext)
      ? 'image'
      : ['wav', 'mp3'].includes(ext)
        ? 'audio'
        : ['ts', 'js', 'py'].includes(ext)
          ? 'code'
          : 'text';
    return buildResult(file.name, type, '');
  },

  async getAnalysis(id: string): Promise<AnalysisResult> {
    await delay(400);
    const fromList = (mockAnalysesData as unknown as Array<{ id: string }>).find(
      (a) => a.id === id,
    );
    if (!fromList) {
      const result = mockResultsData as unknown as AnalysisResult;
      return { ...result, id };
    }
    return { ...(mockResultsData as unknown as AnalysisResult), id };
  },

  async cleanContent(id: string, operations: string[]): Promise<CleanResult> {
    await delay(800);
    return {
      id,
      operations,
      beforeSize: 4832,
      afterSize: 4798,
      removed: operations.map((op) => ({
        type: op,
        count: Math.floor(Math.random() * 5) + 1,
      })),
    };
  },
};
