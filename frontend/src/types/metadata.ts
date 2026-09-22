export interface MetadataEntry {
  key: string;
  value: string;
}

export interface MetadataResult {
  status: 'found' | 'not_found' | 'partial';
  entries: MetadataEntry[];
  format: string;
}
