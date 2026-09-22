export const features = {
  badge: 'Features',
  title: 'Everything you need to inspect provenance',
  subtitle:
    'A complete toolkit for examining the technical layers of digital content, from invisible characters to cryptographic signatures.',
  items: {
    unicode: {
      title: 'Unicode inspection',
      description:
        'Detect invisible characters, zero-width spaces, homoglyphs, and control characters that may encode hidden information or serve as tracking watermarks.',
    },
    metadata: {
      title: 'Metadata analysis',
      description:
        "Extract and examine embedded metadata fields (creator, creation date, software, encoding) to understand a file's provenance trail.",
    },
    c2pa: {
      title: 'C2PA manifest verification',
      description:
        'Detect and validate C2PA content authenticity manifests with cryptographic signature verification for supported media formats.',
    },
    fingerprints: {
      title: 'Known fingerprint matching',
      description:
        'Match content against a curated database of known watermarking schemes and provenance signals with transparent confidence scores.',
    },
    statistics: {
      title: 'Statistical signal detection',
      description:
        'Stylometry and letter-frequency tests against English or French references (auto-detected), with p-value reporting.',
    },
    clean: {
      title: 'Content cleaning',
      description:
        'Remove detectable metadata, invisible characters, and safe-to-remove artifacts while preserving content integrity.',
    },
    reporting: {
      title: 'Transparent reporting',
      description:
        'Every result includes a technical explanation. No black-box scores: understand exactly what was found and why.',
    },
    privacy: {
      title: 'Privacy-first architecture',
      description: 'Content is analysed in your browser. No LLM involved. No account. No training on your data.',
    },
  },
  pipeline: {
    title: 'The inspection pipeline',
    subtitle: 'Every analysis follows a deterministic, auditable pipeline.',
    steps: {
      normalize: { title: 'Normalize', description: 'Content is normalized and prepared for inspection.' },
      inspect: { title: 'Inspect', description: 'Unicode, metadata, and C2PA are examined layer by layer.' },
      detect: { title: 'Detect', description: 'Known fingerprints are matched against the content.' },
      measure: { title: 'Measure', description: 'Statistical tests quantify observed signals with p-values.' },
      report: { title: 'Report', description: 'A transparent, auditable report is generated.' },
      clean: { title: 'Clean', description: 'Optional removal of safe-to-remove artifacts.' },
    },
  },
  cta: {
    title: 'Ready to inspect?',
    body: 'Start analysing content now. Free, open source, no account.',
    button: 'Start analyzing',
  },
};

export const notFound = {
  body: "This page could not be found. The content you're looking for may have been moved or doesn't exist.",
  home: 'Back home',
  analyze: 'Analyze content',
};
