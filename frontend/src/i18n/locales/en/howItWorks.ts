export const howItWorks = {
  title: 'How it works',
  subtitle:
    'A transparent pipeline for AI-origin analysis: every step is inspectable. No black boxes, no opaque scores.',
  steps: {
    normalize: {
      title: 'Normalize',
      description:
        'Content is parsed, encoding is detected, and the input is normalized into a standard representation for analysis.',
    },
    inspect: {
      title: 'Inspect',
      description:
        'The normalized content is examined layer by layer: Unicode characters, metadata fields, and C2PA manifests are extracted and validated.',
    },
    detect: {
      title: 'Detect',
      description:
        'Known fingerprints and watermarking schemes are matched against the content using their respective detection methods.',
    },
    measure: {
      title: 'Measure',
      description:
        'Forensic analysis: for images, frequency-domain up-sampling artifacts and sensor-noise residual; for text, stylometry (burstiness, register, LLM-favoured vocabulary) calibrated for English and French. Each produces a weighted signal.',
    },
    verdict: {
      title: 'Verdict',
      description:
        'All signals combine into one AI-origin verdict with a confidence basis (cryptographic for a signed manifest, metadata, or forensic estimate), and every contributing signal is listed.',
    },
    clean: {
      title: 'Clean',
      description:
        'Optionally, safe-to-remove artifacts such as invisible characters and metadata can be stripped from the content.',
    },
  },
  limits: {
    title: 'What we can and cannot detect',
    subtitle: "Transparency about capabilities is essential. Here's an honest assessment.",
  },
  can: {
    title: 'Can detect',
    items: [
      'AI generation declared in signed C2PA Content Credentials (near-certain)',
      'Generator metadata (Stable Diffusion, Midjourney, Firefly…) and IPTC AI tags',
      'Diffusion / GAN forensic artifacts in images (frequency + noise analysis)',
      'LLM-style stylometry in English and French text (statistical estimate)',
      'Invisible Unicode, homoglyphs and known watermark markers',
    ],
  },
  cannot: {
    title: 'Cannot guarantee',
    items: [
      'That signal-free content is human-made (signals are routinely stripped)',
      'Reliable text verdicts on short, edited, translated or non-native writing',
      'Detection of every generator or a bespoke / removed watermark',
      'A verdict without a stated confidence level (estimates are labelled as such)',
    ],
  },
  disclaimer:
    'A cryptographic verdict (signed Content Credentials) is authoritative. A forensic or metadata verdict is an estimate: an absence of signal is not proof of human origin, and statistical estimates misfire on edited or non-native content. Every verdict states which kind it is.',
  cta: 'Try it now',
};
