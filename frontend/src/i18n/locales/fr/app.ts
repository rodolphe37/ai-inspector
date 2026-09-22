import type * as en from '../en/app';

export const dashboard: typeof en.dashboard = {
  title: 'Bienvenue',
  subtitle:
    'Analyse de provenance déterministe, exécutée dans votre navigateur. Vos analyses restent sur cet appareil.',
  metrics: {
    analyses: 'Analyses',
    signals: 'Signaux détectés',
    clean: 'Résultats propres',
    fingerprints: 'Empreintes connues',
  },
  activity: {
    title: 'Activité d’analyse',
    period: '30 derniers jours',
    analyses: 'Analyses',
    signals: 'Signaux',
  },
  recent: {
    title: 'Analyses récentes',
    viewAll: 'Tout voir',
    emptyDesc: 'Lancez votre première analyse pour la voir ici.',
  },
};

export const history: typeof en.history = {
  title: 'Historique',
  subtitle: 'Analyses enregistrées dans ce navigateur. Elles restent sur cet appareil.',
  filters: {
    all: 'Toutes',
    clean: 'Propres',
    signals: 'Signaux',
    inconclusive: 'Non concluantes',
  },
  search: 'Rechercher une analyse…',
  noResults: 'Aucune analyse trouvée',
  noResultsDesc: 'Essayez de modifier vos filtres ou votre recherche.',
  emptyDesc: 'Lancez votre première analyse pour construire votre historique.',
  delete: 'Supprimer {{name}}',
  page: 'Page {{page}} sur {{total}}',
};

export const analyze: typeof en.analyze = {
  title: 'Analyser un contenu',
  subtitle:
    'Inspectez un texte, du code ou un fichier à la recherche de signaux d’origine IA et de provenance, dans votre navigateur.',
  sample:
    "L'évolution rapide des modèles d'apprentissage automatique a profondément transformé notre rapport aux contenus numériques. Comprendre la provenance de l'information est essentiel pour préserver la confiance dans l'écosystème médiatique.\n\nLes signaux de provenance, les métadonnées et la détection de filigranes offrent une base technique à l'attribution des contenus, sans dépendre de classifieurs d'IA faillibles. En examinant les caractères Unicode, les champs de métadonnées, les manifestes C2PA et les distributions statistiques, on peut dresser un portrait transparent de l'histoire d'un contenu.",
  plainText: 'Texte brut',
  counts: '{{chars}} car. · {{words}} mots',
  paste: 'Coller',
  clear: 'Effacer',
  placeholder: 'Collez ou saisissez le contenu à analyser…',
  run: 'Analyser',
  drop: 'Déposez votre fichier ici',
  browse: 'ou cliquez pour parcourir',
  unknownType: 'inconnu',
  removeFile: 'Retirer le fichier',
  fileReady: 'Fichier prêt pour l’analyse',
  fileLocal: 'Fichier lu localement dans votre navigateur',
  running: 'Analyse en cours',
  error: 'L’analyse a échoué. Veuillez réessayer.',
  steps: {
    normalizing: 'Normalisation',
    unicode: 'Inspection Unicode',
    metadata: 'Inspection des métadonnées',
    provenance: 'Inspection de la provenance',
    fingerprints: 'Recherche d’empreintes',
    statistics: 'Analyse statistique',
    report: 'Construction du rapport',
  },
};

export const results: typeof en.results = {
  title: 'Analyse terminée',
  notAvailable: 'Résultat indisponible.',
  backToHistory: 'Retour à l’historique',
  export: 'Exporter le rapport',
  again: 'Nouvelle analyse',
  signalLevel: {
    title: 'Niveau de signal de provenance',
    description:
      'La quantité globale de signaux techniques de provenance (Unicode, métadonnées, filigranes, manifestes). C’est distinct du verdict d’origine IA ci-dessus.',
  },
  unicode: {
    invisible: 'Caractères invisibles',
    control: 'Caractères de contrôle',
    homoglyphs: 'Homoglyphes suspects',
  },
  metadata: 'Métadonnées',
  c2pa: {
    signature: 'Signature',
    valid: 'valide',
    invalid: 'non validée',
    aiClaim: 'Déclaration de génération IA',
    composite: 'Composite assisté par IA',
    signer: 'Signataire',
    generator: 'Générateur',
    software: 'Logiciel',
    issues: 'Problèmes de validation : {{errors}}',
    textOnly: 'Les Content Credentials C2PA concernent les fichiers média, pas le texte brut.',
    none: 'Aucun manifeste C2PA / Content Credentials intégré n’a été trouvé. À noter : ces données sont souvent effacées par les captures d’écran et les réseaux sociaux.',
  },
  fingerprints: {
    title: 'Empreintes connues',
    none: 'Aucune empreinte connue ne s’applique à ce contenu (ou le catalogue n’a pas pu être chargé).',
  },
  stats: {
    title: 'Analyse statistique',
    reference: 'Référence : {{lang}}',
    languages: { en: 'anglais', fr: 'français' },
    chi2: 'χ² (distrib. des lettres)',
    threshold: 'Seuil',
    entropy: 'Entropie (bits/car.)',
    observed: '% observé',
    expected: '% attendu',
    conclusion: 'Conclusion :',
  },
  timeline: 'Ce que nous avons trouvé',
  important: 'Important',
  verdict: {
    ai: 'IA',
    breakdown: 'Détail des signaux ({{count}})',
    confidence: {
      cryptographic: 'Preuve cryptographique',
      metadata: 'Fondé sur les métadonnées',
      statistical: 'Estimation forensique',
      none: 'Aucun signal',
    },
  },
};

export const fingerprints: typeof en.fingerprints = {
  title: 'Empreintes connues',
  subtitle: 'Méthodes de détection utilisées pour identifier des signaux de provenance connus.',
  search: 'Rechercher une empreinte…',
  empty: 'Aucune empreinte trouvée',
  emptyDesc: 'Essayez une autre recherche, ou vérifiez que l’API est joignable.',
  details: 'Voir le détail',
  notFound: 'Empreinte introuvable.',
  back: 'Retour aux empreintes',
  properties: 'Propriétés',
  version: 'Version',
  target: 'Contenu ciblé',
  coverage: 'Couverture',
  updated: 'Dernière mise à jour',
  metrics: 'Métriques de détection',
  confidence: 'Confiance',
  method: 'Méthode de détection',
  description: 'Description',
  capabilities: 'Capacités & limites',
  can: [
    'Les motifs de filigrane connus correspondant à cette signature',
    'Les anomalies de distribution statistique dans le contenu ciblé',
    'Les contenus correspondant aux paramètres de détection de l’empreinte',
  ],
  cannot: [
    'La détection de schémas de filigrane inconnus ou modifiés',
    'L’absence de tout filigrane possible',
    'Une attribution définitive de l’origine du contenu',
  ],
};

export const status: typeof en.status = {
  detection: {
    clean: 'Propre',
    found: 'Trouvé',
    not_found: 'Non trouvé',
    possible: 'Possible',
    inconclusive: 'Non concluant',
    failed: 'Échec',
  },
  analysis: {
    clean: 'Propre',
    possible_signal: 'Signal détecté',
    signal_detected: 'Signal détecté',
    inconclusive: 'Non concluant',
    c2pa_found: 'C2PA trouvé',
    failed: 'Échec',
  },
  signalLevel: {
    clean: 'Propre',
    low: 'Faible',
    moderate: 'Modéré',
    high: 'Élevé',
    critical: 'Critique',
  },
  fingerprint: {
    available: 'Disponible',
    experimental: 'Expérimental',
    deprecated: 'Obsolète',
    research: 'Recherche',
  },
  method: {
    statistical: 'Statistique',
    structural: 'Structurel',
    cryptographic: 'Cryptographique',
    pattern: 'Motif',
  },
  type: {
    text: 'Texte',
    code: 'Code',
    image: 'Image',
    audio: 'Audio',
    video: 'Vidéo',
    pdf: 'PDF',
    docx: 'DOCX',
    file: 'Fichier',
  },
};
