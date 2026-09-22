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
  drop: 'Drop a file to clean',
  dropDesc: 'Images: full metadata strip, done in your browser.',
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
    notifications: 'Notifications',
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
    local: 'Local processing',
    localDesc: 'Content is always analysed in your browser',
    history: 'Store analysis history',
    historyDesc: 'Keep a record in this browser',
    telemetry: 'Telemetry',
    telemetryDesc: 'Send anonymous usage data',
  },
  analysis: {
    detailed: 'Detailed results',
    detailedDesc: 'Show expanded result information',
    stats: 'Show statistical data',
    statsDesc: 'Display statistical charts and metrics',
    technical: 'Show technical information',
    technicalDesc: 'Display technical details in reports',
  },
  notifications: {
    complete: 'Analysis complete',
    completeDesc: 'Notify when an analysis finishes',
    security: 'Security alerts',
    securityDesc: 'Get notified about security events',
  },
};
