import type { features as enFeatures, notFound as enNotFound } from '../en/features';

export const features: typeof enFeatures = {
  badge: 'Fonctionnalités',
  title: 'Tout ce qu’il faut pour inspecter la provenance',
  subtitle:
    'Une boîte à outils complète pour examiner les couches techniques d’un contenu numérique, des caractères invisibles aux signatures cryptographiques.',
  items: {
    unicode: {
      title: 'Inspection Unicode',
      description:
        'Détecte les caractères invisibles, espaces de largeur nulle, homoglyphes et caractères de contrôle qui peuvent cacher de l’information ou servir de filigrane de traçage.',
    },
    metadata: {
      title: 'Analyse des métadonnées',
      description:
        'Extrait et examine les métadonnées intégrées (créateur, date de création, logiciel, encodage) pour retracer la provenance d’un fichier.',
    },
    c2pa: {
      title: 'Vérification des manifestes C2PA',
      description:
        'Détecte et valide les manifestes d’authenticité C2PA avec vérification cryptographique de la signature pour les formats pris en charge.',
    },
    fingerprints: {
      title: 'Correspondance d’empreintes connues',
      description:
        'Compare le contenu à une base de schémas de filigrane et de signaux de provenance connus, avec des scores de confiance transparents.',
    },
    statistics: {
      title: 'Détection de signaux statistiques',
      description:
        'Stylométrie et tests de fréquence des lettres par rapport à des références anglaise ou française (détection automatique), avec p-values.',
    },
    clean: {
      title: 'Nettoyage de contenu',
      description:
        'Supprime les métadonnées détectables, les caractères invisibles et les artefacts sans risque, en préservant l’intégrité du contenu.',
    },
    reporting: {
      title: 'Rapports transparents',
      description:
        'Chaque résultat inclut une explication technique. Pas de score opaque : vous savez exactement ce qui a été trouvé et pourquoi.',
    },
    privacy: {
      title: 'Architecture respectueuse de la vie privée',
      description:
        'Le contenu est analysé dans votre navigateur. Aucun LLM. Aucun compte. Aucun entraînement sur vos données.',
    },
  },
  pipeline: {
    title: 'Le pipeline d’inspection',
    subtitle: 'Chaque analyse suit un pipeline déterministe et vérifiable.',
    steps: {
      normalize: { title: 'Normaliser', description: 'Le contenu est normalisé et préparé pour l’inspection.' },
      inspect: { title: 'Inspecter', description: 'Unicode, métadonnées et C2PA sont examinés couche par couche.' },
      detect: { title: 'Détecter', description: 'Les empreintes connues sont comparées au contenu.' },
      measure: { title: 'Mesurer', description: 'Des tests statistiques quantifient les signaux observés avec des p-values.' },
      report: { title: 'Rapporter', description: 'Un rapport transparent et vérifiable est généré.' },
      clean: { title: 'Nettoyer', description: 'Suppression optionnelle des artefacts sans risque.' },
    },
  },
  cta: {
    title: 'Prêt à inspecter ?',
    body: 'Analysez un contenu dès maintenant. Gratuit, open source, sans compte.',
    button: 'Commencer l’analyse',
  },
};

export const notFound: typeof enNotFound = {
  body: 'Cette page est introuvable. Le contenu recherché a peut-être été déplacé ou n’existe pas.',
  home: 'Retour à l’accueil',
  analyze: 'Analyser un contenu',
};
