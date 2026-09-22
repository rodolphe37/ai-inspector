export const landing = {
  hero: {
    badge: 'AI-origin & provenance analysis',
    title: 'Was this made by AI?',
    subtitle:
      'An AI-origin analysis for text, code and images: cryptographic Content Credentials, generator metadata, watermark markers and forensic detection. Every verdict comes with its evidence and an honest confidence level.',
    cta: 'Analyze content',
    secondary: 'How it works',
    tags: 'Free · Open source · In-browser · No LLM · Every verdict shows its evidence',
  },
  demo: {
    title: 'Live demo',
    subtitle:
      'A real analysis running in your browser: AI-origin estimate plus provenance signals. Edit the text and run it.',
    input: 'INPUT',
    output: 'OUTPUT',
    plaintext: 'plaintext',
    analyzing: 'Analyzing…',
    run: 'Analyze demo',
    preview: 'preview · full pipeline in the app',
    empty: 'Results will appear here after analysis',
    steps: ['Normalizing', 'Inspecting Unicode', 'Matching fingerprints'],
    sample:
      "In today's rapidly evolving digital landscape, understanding the provenance of information has become increasingly crucial. It is important to note that content attribution plays a pivotal role in fostering trust across modern media ecosystems. Furthermore, by leveraging robust analytical frameworks, organizations can navigate the complexities of an ever-changing environment. Additionally, this holistic approach underscores the significance of transparency and accountability. Consequently, stakeholders are better equipped to make informed decisions. In conclusion, provenance analysis represents a game-changing paradigm that will continue to shape the future of digital content verification.",
    rows: {
      ai: 'AI-origin estimate',
      aiTooShort: 'sample too short for a stylometric estimate',
      lowReliability: ' (low reliability)',
      invisible: 'Invisible Unicode',
      invisibleFound: '{{count}} character(s)',
      homoglyphs: 'Homoglyphs',
      homoglyphsFound: '{{count}} cross-script letter(s)',
      none: 'none detected',
      letters: 'Letter distribution',
      lettersDetail: 'χ²={{chi2}} · entropy {{entropy}} bits/char',
    },
  },
  why: {
    badge: 'Evidence, not a black box',
    title: 'A different approach to AI detection',
    cards: {
      inspect: {
        title: 'Inspect',
        description:
          'Metadata, Unicode, provenance, signatures. Examine the technical layers of digital content.',
      },
      measure: {
        title: 'Measure',
        description:
          'Statistics, probabilities and known signals. Quantify what you observe with transparent metrics.',
      },
      explain: {
        title: 'Explain',
        description:
          'Every result is accompanied by a technical explanation. No black boxes, no opaque scores.',
      },
    },
  },
  pipeline: {
    title: 'Analysis pipeline',
    subtitle: 'How content flows through the inspection engine',
    steps: {
      content: 'Content',
      normalization: 'Normalization',
      engine: 'Analysis engine',
      unicode: 'Unicode',
      metadata: 'Metadata',
      c2pa: 'C2PA',
      statistics: 'Statistical tests',
      fingerprints: 'Known fingerprints',
      report: 'Report',
    },
  },
  privacy: {
    badge: 'Privacy first',
    title: 'Your content should remain yours.',
    body: 'AI Inspector analyses everything in your browser. No content is sent to a server. No LLM is involved. No account, no tracking, no training on your data.',
    items: [
      'Analysis runs 100% in your browser',
      'No LLM involved',
      'No training on user data',
      'No account and no tracking',
      'History stays on your device',
      'Open source, auditable end to end',
    ],
    diagram: {
      browser: 'Browser',
      local: 'Local analysis',
      report: 'Report',
      backend: 'No application server: everything ships with the app',
    },
  },
  cta: {
    title: 'Start inspecting your content',
    body: 'Free and open source: no account, no limits. The full analysis pipeline runs in your browser.',
    button: 'Launch application',
  },
};
