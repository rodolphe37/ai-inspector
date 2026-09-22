import type { clean as enClean, settings as enSettings } from '../en/tools';

export const clean: typeof enClean = {
  title: 'Nettoyer un contenu',
  subtitle: 'Supprimez les caractères invisibles et les métadonnées intégrées en local, puis téléchargez le résultat.',
  warning:
    'Supprimer les métadonnées efface définitivement les informations sur l’origine du contenu (EXIF, XMP, Content Credentials C2PA). C’est irréversible sur la copie nettoyée.',
  // Contient volontairement des caractères cachés (espace de largeur nulle, liant, gluon de mots).
  sample:
    'L’évolution​ rapide des modèles‍ d’apprentissage automatique a⁠ transformé notre rapport aux contenus numériques.   \nComprendre la provenance de l’information est essentiel.',
  ops: {
    unicode: 'Supprimer l’Unicode invisible',
    unicodeDesc: 'Espaces de largeur nulle, liants, caractères tag, contrôles bidi, homoglyphes.',
    trim: 'Supprimer les espaces de fin de ligne',
    trimDesc: 'Retire les espaces/tabulations finales et réduit les suites de lignes vides.',
    newlines: 'Normaliser les fins de ligne en LF',
    newlinesDesc: 'Convertit CRLF / CR en LF.',
  },
  risk: {
    safe: 'sans risque',
    warning: 'prudence',
  },
  drop: 'Déposez un fichier à nettoyer',
  dropDesc: 'Images : suppression complète des métadonnées, dans votre navigateur.',
  local: 'Tout se passe dans votre navigateur',
  preview: 'Aperçu',
  previewTitle: 'Aperçu des modifications',
  noChanges: 'Aucune modification avec les options actuelles.',
  before: 'Avant',
  after: 'Après',
  apply: 'Appliquer',
  run: 'Nettoyer',
  done: 'Nettoyé',
  nothing: 'Aucun artefact détectable n’était présent.',
  download: 'Télécharger {{name}}',
  unsupported: 'Ce type de fichier ne peut pas encore être nettoyé dans le navigateur.',
  failed: 'Le nettoyage a échoué.',
};

export const settings: typeof enSettings = {
  title: 'Réglages',
  subtitle: 'Préférences de confidentialité, d’apparence et d’analyse, enregistrées dans ce navigateur.',
  sections: {
    data: 'Vos données',
    appearance: 'Apparence',
    privacy: 'Confidentialité',
    analysis: 'Analyse',
    notifications: 'Notifications',
  },
  data: {
    body: 'AI Inspector est libre et open source : pas de compte, pas de limite. Le contenu est analysé dans votre navigateur, et votre historique et vos réglages sont stockés uniquement ici, dans ce navigateur.',
    clear: 'Effacer l’historique des analyses',
    cleared: 'Historique effacé',
    confirm: 'Supprimer toutes les analyses enregistrées dans ce navigateur ? Cette action est irréversible.',
  },
  appearance: {
    theme: 'Thème',
    themes: { dark: 'Sombre', light: 'Clair', system: 'Système' },
  },
  privacy: {
    local: 'Traitement local',
    localDesc: 'Le contenu est toujours analysé dans votre navigateur',
    history: 'Conserver l’historique des analyses',
    historyDesc: 'Garder une trace dans ce navigateur',
    telemetry: 'Télémétrie',
    telemetryDesc: 'Envoyer des données d’usage anonymes',
  },
  analysis: {
    detailed: 'Résultats détaillés',
    detailedDesc: 'Afficher les informations de résultat étendues',
    stats: 'Afficher les données statistiques',
    statsDesc: 'Afficher les graphiques et métriques statistiques',
    technical: 'Afficher les informations techniques',
    technicalDesc: 'Afficher les détails techniques dans les rapports',
  },
  notifications: {
    complete: 'Analyse terminée',
    completeDesc: 'Prévenir quand une analyse se termine',
    security: 'Alertes de sécurité',
    securityDesc: 'Être prévenu des événements de sécurité',
  },
};
