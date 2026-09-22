import type { footer as enFooter, nav as enNav } from '../en/layout';

export const nav: typeof enNav = {
  public: {
    features: 'Fonctionnalités',
    howItWorks: 'Fonctionnement',
    security: 'Sécurité',
    about: 'À propos',
  },
  app: {
    dashboard: 'Tableau de bord',
    overview: 'Vue d’ensemble',
    analyze: 'Analyser',
    history: 'Historique',
    fingerprints: 'Empreintes',
    clean: 'Nettoyer',
    settings: 'Réglages',
  },
  launchApp: 'Lancer l’app',
  openMenu: 'Ouvrir le menu',
  closeMenu: 'Fermer le menu',
  localPrivate: 'Local & privé',
  freeOpenSource: 'Libre & open source',
  viewOnGithub: 'Voir sur GitHub',
};

export const footer: typeof enFooter = {
  tagline:
    'Analyse de provenance indépendante. Inspectez un contenu numérique à la recherche de signaux connus, métadonnées, filigranes et indices forensiques, avec un niveau de confiance clair, pas une boîte noire.',
  product: 'Produit',
  project: 'Projet',
  sourceCode: 'Code source',
  version: 'Notes de version',
  copyright:
    '© 2026 AI Inspector. Libre & open source (MIT). L’absence de signal ne constitue pas une preuve d’origine humaine.',
  local:
    'Le contenu est analysé localement dans votre navigateur. Fondé sur des preuves : chaque verdict montre sa base.',
};
