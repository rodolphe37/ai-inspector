export const landing = {
  hero: {
    badge: 'AI-origin & provenance analysis',
    title: 'Was this made by AI?',
    subtitle:
      'An AI-origin analysis for text, code, images, PDF and Word documents, audio and video: cryptographic Content Credentials, generator metadata, watermark markers and forensic detection. Every verdict comes with its evidence and an honest confidence level.',
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
  formats: {
    badge: 'Supported formats',
    title: 'Text, code, images, documents, audio and video',
    subtitle: 'Every format is analysed and cleaned in your browser. Metadata is removed without re-encoding whenever the format allows it.',
    note: 'Cleaning removes metadata only: pixels, sound, video frames and document text stay byte for byte identical. OGG can be analysed but not cleaned without re-encoding.',
    items: {
      text: {
        name: 'Text',
        analysis: 'Invisible characters, homoglyphs, bidi controls, stylometry (English and French).',
        clean: 'Removes invisible characters and homoglyphs, normalises spaces and line endings.',
      },
      code: {
        name: 'Code',
        analysis: 'Trojan Source (bidi), hidden characters, code stylometry.',
        clean: 'Removes invisible and bidi characters without touching the code.',
      },
      image: {
        name: 'Images',
        analysis: 'C2PA Content Credentials, EXIF / XMP / IPTC, generator signatures (Stable Diffusion, ComfyUI, Midjourney…), spectral analysis.',
        clean: 'Strips EXIF, XMP, IPTC and C2PA losslessly (HEIC / AVIF are re-encoded).',
      },
      pdf: {
        name: 'PDF',
        analysis: 'Document properties, XMP, C2PA, producing software, stylometry of the extracted text.',
        clean: 'Removes properties, XMP and embedded files (including C2PA).',
      },
      docx: {
        name: 'Word (DOCX)',
        analysis: 'Author, application and custom properties, stylometry of the text.',
        clean: 'Blanks author, application and custom properties.',
      },
      audio: {
        name: 'Audio',
        analysis: 'C2PA, ID3 / RIFF / Vorbis / MP4 tags, generator signatures (Suno, Udio, ElevenLabs…).',
        clean: 'Strips tags and C2PA without touching the audio stream.',
      },
      video: {
        name: 'Video',
        analysis: 'C2PA, container metadata, generator signatures (Sora, Runway, Veo, Pika…).',
        clean: 'Neutralises metadata boxes and C2PA without touching the video stream.',
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
