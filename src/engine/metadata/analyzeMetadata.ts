import type { MetadataResult } from '@/types/metadata';

export function analyzeMetadata(file: { name: string; type: string; size?: number }): MetadataResult {
  return {
    status: 'found',
    format: file.name.split('.').pop()?.toUpperCase() || 'Unknown',
    entries: [
      { key: 'Creator', value: 'Example Application' },
      { key: 'Created', value: new Date().toISOString().split('T')[0] },
      { key: 'Modified', value: new Date().toISOString().split('T')[0] },
      { key: 'Encoding', value: 'UTF-8' },
    ],
  };
}
