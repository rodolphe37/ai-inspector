import type { common as en } from '../en/common';

export const common: typeof en = {
  appName: 'AI Inspector',
  meta: {
    title: 'AI Inspector : est-ce fait par une IA ?',
    description:
      'Analyse d’origine IA libre et open source pour le texte, le code et les images : Content Credentials C2PA, métadonnées de générateur, filigranes et détection forensique. Chaque verdict montre ses preuves. Tout se passe dans votre navigateur.',
  },
  analysedLocally: 'Analysé localement dans votre navigateur',
  absenceNotProof: 'L’absence de signal ne constitue pas une preuve d’origine humaine.',
  privacyFirst: 'Confidentialité d’abord',
  today: 'Aujourd’hui',
  yesterday: 'Hier',
  noAnalyses: 'Aucune analyse pour l’instant',
  newAnalysis: 'Nouvelle analyse',
  view: 'Voir',
  loading: 'Chargement…',
  previous: 'Précédent',
  next: 'Suivant',
  yes: 'oui',
  none: 'aucune',
  text: 'Texte',
  file: 'Fichier',
  table: {
    name: 'Nom',
    analysis: 'Analyse',
    type: 'Type',
    date: 'Date',
    result: 'Résultat',
    score: 'Score',
    actions: 'Actions',
  },
  close: 'Fermer',
  language: 'Langue',
};
