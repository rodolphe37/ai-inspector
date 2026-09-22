export const security = {
  title: 'Security & privacy',
  subtitle: 'Built from the ground up with privacy as the default, not an afterthought.',
  principles: {
    privacy: {
      title: 'Privacy first',
      description:
        'Your content should remain yours. Analysis runs in your browser and content is never uploaded. There are no accounts: nothing about you is stored on a server.',
    },
    noLlm: {
      title: 'No LLM',
      description:
        'AI Inspector does not use any large language model. All analysis is algorithmic and statistical, deterministic and reproducible.',
    },
    noTraining: {
      title: 'No training on your content',
      description:
        'Your data is never used for training, fine-tuning, or any machine learning purpose. There is no model improvement loop involving user content.',
    },
    localFirst: {
      title: 'Local-first architecture',
      description:
        'The analysis engine and the catalogue of known detection methods ship with the app and run entirely in the browser. There is no application server.',
    },
    noServerData: {
      title: 'No user data anywhere but your device',
      description:
        'History and settings live in your browser (IndexedDB) and can be wiped at any time. The code is open source, so you can verify it.',
    },
    transparent: {
      title: 'Transparent analysis',
      description:
        'Every result is accompanied by a technical explanation. Detection methods, thresholds, and p-values are visible in every report.',
    },
  },
  architecture: {
    title: 'Local-first architecture',
    browser: 'Browser',
    engine: 'Local analysis engine',
    report: 'Report',
    backend: 'No application server: a static site, nothing to receive your data',
    storage: 'Local storage only',
  },
  commitments: {
    title: 'Our commitments',
    items: [
      'Content is analysed locally; it is never sent to a server for inspection',
      'No large language model is used; detection is deterministic and inspectable',
      'No content is used for training or model improvement',
      'No tracking of content or analysis results',
      'All detection methods are documented and transparent',
      'No accounts and no server-side history: your data stays on your device',
      'Open source: every line of the pipeline can be audited',
    ],
  },
  cta: 'Start inspecting',
};

export const about = {
  title: 'About AI Inspector',
  subtitle: 'An independent AI-origin analyser for text, code, images, PDF and Word documents, audio and video. Evidence-based, not a black box.',
  mission: {
    title: 'Our mission',
    p1: 'AI Inspector answers “was this made by AI?” the way it should be answered: by showing its work. Cryptographic Content Credentials, generator metadata, watermark markers and forensic analysis: each verdict lists the evidence behind it and states how confident it is.',
    p2: 'When there is hard evidence (a signed C2PA manifest), we say so with near-certainty. When there is only a statistical estimate, we say that too, and we are honest that it has a real false-positive rate on edited, translated or non-native content. We never dress up a guess as proof.',
  },
  values: {
    transparency: {
      title: 'Transparency',
      description:
        'Every result is explainable. Detection methods, thresholds, and p-values are visible. No black boxes.',
    },
    privacy: {
      title: 'Privacy',
      description: 'Local-first by design. Your content stays yours. No LLM, no training, no tracking.',
    },
    precision: {
      title: 'Precision',
      description: 'Deterministic, reproducible analysis. The same input always produces the same output.',
    },
  },
  positioning: {
    title: "What we are, and what we aren't",
    areTitle: 'We are:',
    are: 'An inspection tool for known provenance signals, metadata, Unicode artifacts, C2PA manifests, and statistical watermark patterns.',
    areNotTitle: 'We are not:',
    areNot:
      'An oracle. We do not make definitive claims about authorship. An absence of signal does not prove human origin, and a detected signal does not prove machine generation.',
  },
  openSource: {
    title: 'Free & open source',
    body: 'AI Inspector is released under the MIT licence. No account, no quota, no paid tier: just the code. Issues, translations and pull requests are welcome.',
    link: 'Browse the code on GitHub',
  },
  cta: 'Start inspecting',
};
