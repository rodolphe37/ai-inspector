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
  languageLabel: 'Langage du texte',
  inputLabel: 'Texte à nettoyer',
  detected: '{{count}} caractère(s) invisible(s) ou suspect(s) repéré(s)',
  noneDetected: 'Aucun caractère invisible ou suspect dans ce texte.',
  legend: 'Les repères montrent des caractères normalement invisibles. Survolez-en un pour voir de quoi il s’agit. Les lettres en rouge sont des sosies venant d’un autre alphabet.',
  copy: 'Copier le texte nettoyé',
  copied: 'Copié',
  drop: 'Déposez un fichier à nettoyer',
  dropDesc: 'Fichiers texte et code, images, PDF, DOCX, audio (MP3, WAV, FLAC, M4A) et vidéo (MP4, MOV, AVI). Tout est nettoyé dans votre navigateur.',
  lossless: 'Sans réencodage : image, son et vidéo intacts',
  reencoded: 'Réencodé (ce format n’a pas de méthode sans perte)',
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
    history: 'Conserver l’historique des analyses',
    historyDesc: 'Enregistrer les analyses dans ce navigateur. Désactivé, un résultat n’est conservé que jusqu’à la fermeture de la page.',
  },
  analysis: {
    detailed: 'Résultats détaillés',
    detailedDesc: 'Afficher le détail des signaux et les constats étape par étape',
    stats: 'Données statistiques',
    statsDesc: 'Afficher le test de fréquence des lettres (chiffres et graphique)',
    technical: 'Détails techniques',
    technicalDesc: 'Afficher le niveau de signal et les cartes Unicode, métadonnées, C2PA et empreintes',
  },
};
