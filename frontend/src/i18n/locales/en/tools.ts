export const clean = {
  title: 'Clean content',
  subtitle: 'Strip invisible characters and embedded metadata locally, then download the result.',
  warning:
    "Removing metadata permanently discards information about the content's origin (EXIF, XMP, C2PA Content Credentials). This cannot be undone on the cleaned copy.",
  // Contains hidden characters on purpose (zero-width space, joiner, word joiner).
  sample:
    'The rapid​ advancement of machine‍ learning models has⁠ transformed how we interact with digital content.   \nUnderstanding the provenance of information is essential.',
  ops: {
    unicode: 'Remove invisible Unicode',
    unicodeDesc: 'Zero-width spaces, joiners, tag chars, bidi overrides, homoglyphs.',
    trim: 'Trim trailing whitespace',
    trimDesc: 'Remove trailing spaces/tabs and collapse blank-line runs.',
    newlines: 'Normalise line endings to LF',
    newlinesDesc: 'Convert CRLF / CR to LF.',
  },
  risk: {
    safe: 'safe',
    warning: 'caution',
  },
  languageLabel: 'Text language',
  inputLabel: 'Text to clean',
  detected: '{{count}} invisible or suspicious character(s) found',
  noneDetected: 'No invisible or suspicious character in this text.',
  legend: 'Markers show characters that are normally invisible. Hover one to see what it is. Red letters are look-alikes from another alphabet.',
  copy: 'Copy cleaned text',
  copied: 'Copied',
  drop: 'Drop a file to clean',
  dropDesc: 'Text and code files, images, PDF, DOCX, audio (MP3, WAV, FLAC, M4A) and video (MP4, MOV, AVI). Everything is cleaned in your browser.',
  lossless: 'Without re-encoding: image, sound and video are untouched',
  reencoded: 'Re-encoded (this format has no lossless path)',
  local: 'Everything happens in your browser',
  preview: 'Preview',
  previewTitle: 'Preview changes',
  noChanges: 'No changes with the current options.',
  before: 'Before',
  after: 'After',
  apply: 'Apply',
  run: 'Clean',
  done: 'Cleaned',
  nothing: 'No detectable artifacts were present.',
  download: 'Download {{name}}',
  unsupported: 'This file type cannot be cleaned in the browser yet.',
  failed: 'Cleaning failed.',
};

export const settings = {
  title: 'Settings',
  subtitle: 'Privacy, appearance and analysis preferences, stored in this browser.',
  sections: {
    data: 'Your data',
    appearance: 'Appearance',
    privacy: 'Privacy',
    analysis: 'Analysis',
  },
  data: {
    body: 'AI Inspector is free and open source: no account, no limits. Content is analysed in your browser, and your history and settings are stored only here, in this browser.',
    clear: 'Clear analysis history',
    cleared: 'History cleared',
    confirm: 'Delete every saved analysis from this browser? This cannot be undone.',
  },
  appearance: {
    theme: 'Theme',
    themes: { dark: 'Dark', light: 'Light', system: 'System' },
  },
  privacy: {
    history: 'Store analysis history',
    historyDesc: 'Save analyses in this browser. When off, a result is only kept until the page is closed.',
  },
  analysis: {
    detailed: 'Detailed results',
    detailedDesc: 'Show the signal breakdown and the step-by-step findings',
    stats: 'Statistical data',
    statsDesc: 'Show the letter-frequency test (figures and chart)',
    technical: 'Technical details',
    technicalDesc: 'Show the signal level and the Unicode, metadata, C2PA and fingerprint cards',
  },
};
