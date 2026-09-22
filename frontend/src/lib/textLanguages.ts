/** Languages offered for pasted text (Analyze and Clean pages). */
export const TEXT_LANGUAGES = [
  { id: 'plaintext', label: null, ext: 'txt', mime: 'text/plain' },
  { id: 'javascript', label: 'JavaScript', ext: 'js', mime: 'text/javascript' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts', mime: 'text/plain' },
  { id: 'python', label: 'Python', ext: 'py', mime: 'text/x-python' },
  { id: 'markdown', label: 'Markdown', ext: 'md', mime: 'text/markdown' },
  { id: 'json', label: 'JSON', ext: 'json', mime: 'application/json' },
  { id: 'html', label: 'HTML', ext: 'html', mime: 'text/html' },
  { id: 'css', label: 'CSS', ext: 'css', mime: 'text/css' },
] as const;

export type TextLanguage = (typeof TEXT_LANGUAGES)[number]['id'];

/** Source code, as opposed to prose (plain text, Markdown). */
export const isCodeLanguage = (lang: string) => lang !== 'plaintext' && lang !== 'markdown';

export const languageInfo = (lang: string) => TEXT_LANGUAGES.find((l) => l.id === lang) ?? TEXT_LANGUAGES[0];
