import type { about as enAbout, security as enSecurity } from '../en/pages';

export const security: typeof enSecurity = {
  title: 'Sécurité & confidentialité',
  subtitle: 'Conçu dès le départ avec la confidentialité par défaut, pas comme une réflexion après coup.',
  principles: {
    privacy: {
      title: 'La confidentialité d’abord',
      description:
        'Votre contenu doit rester le vôtre. L’analyse s’exécute dans votre navigateur et le contenu n’est jamais envoyé. Il n’y a pas de compte : rien vous concernant n’est stocké sur un serveur.',
    },
    noLlm: {
      title: 'Sans LLM',
      description:
        'AI Inspector n’utilise aucun grand modèle de langage. Toute l’analyse est algorithmique et statistique, déterministe et reproductible.',
    },
    noTraining: {
      title: 'Aucun entraînement sur vos contenus',
      description:
        'Vos données ne servent jamais à entraîner ou affiner un modèle. Aucune boucle d’amélioration n’utilise les contenus des utilisateurs.',
    },
    localFirst: {
      title: 'Architecture locale d’abord',
      description:
        'Le moteur d’analyse et le catalogue des méthodes de détection connues sont intégrés à l’application et tournent entièrement dans le navigateur. Il n’y a aucun serveur applicatif.',
    },
    noServerData: {
      title: 'Aucune donnée utilisateur ailleurs que sur votre appareil',
      description:
        'L’historique et les réglages restent dans votre navigateur (IndexedDB) et peuvent être effacés à tout moment. Le code est open source : vous pouvez le vérifier.',
    },
    transparent: {
      title: 'Analyse transparente',
      description:
        'Chaque résultat est accompagné d’une explication technique. Méthodes, seuils et p-values sont visibles dans chaque rapport.',
    },
  },
  architecture: {
    title: 'Architecture locale d’abord',
    browser: 'Navigateur',
    engine: 'Moteur d’analyse local',
    report: 'Rapport',
    backend: 'Aucun serveur applicatif : un site statique, rien pour recevoir vos données',
    storage: 'Stockage local uniquement',
  },
  commitments: {
    title: 'Nos engagements',
    items: [
      'Le contenu est analysé localement ; il n’est jamais envoyé à un serveur',
      'Aucun grand modèle de langage ; la détection est déterministe et inspectable',
      'Aucun contenu n’est utilisé pour entraîner ou améliorer un modèle',
      'Aucun pistage des contenus ni des résultats',
      'Toutes les méthodes de détection sont documentées et transparentes',
      'Ni compte ni historique côté serveur : vos données restent sur votre appareil',
      'Open source : chaque ligne du pipeline peut être auditée',
    ],
  },
  cta: 'Commencer l’inspection',
};

export const about: typeof enAbout = {
  title: 'À propos d’AI Inspector',
  subtitle:
    'Un analyseur indépendant d’origine IA pour le texte, le code, les images, les documents PDF et Word, l’audio et la vidéo. Fondé sur des preuves, pas une boîte noire.',
  mission: {
    title: 'Notre mission',
    p1: 'AI Inspector répond à « est-ce que ça a été fait par une IA ? » comme il se doit : en montrant son travail. Content Credentials cryptographiques, métadonnées de générateur, marqueurs de filigrane et analyse forensique : chaque verdict liste les preuves qui le fondent et indique son niveau de confiance.',
    p2: 'Quand il existe une preuve solide (un manifeste C2PA signé), nous le disons avec une quasi-certitude. Quand il n’y a qu’une estimation statistique, nous le disons aussi, en reconnaissant qu’elle a un vrai taux de faux positifs sur les contenus retouchés, traduits ou non natifs. Nous ne faisons jamais passer une supposition pour une preuve.',
  },
  values: {
    transparency: {
      title: 'Transparence',
      description:
        'Chaque résultat est explicable. Méthodes de détection, seuils et p-values sont visibles. Pas de boîte noire.',
    },
    privacy: {
      title: 'Confidentialité',
      description:
        'Local par conception. Votre contenu reste le vôtre. Pas de LLM, pas d’entraînement, pas de pistage.',
    },
    precision: {
      title: 'Précision',
      description: 'Analyse déterministe et reproductible. La même entrée produit toujours le même résultat.',
    },
  },
  positioning: {
    title: 'Ce que nous sommes, et ce que nous ne sommes pas',
    areTitle: 'Nous sommes :',
    are: 'Un outil d’inspection des signaux de provenance connus, des métadonnées, des artefacts Unicode, des manifestes C2PA et des motifs statistiques de filigrane.',
    areNotTitle: 'Nous ne sommes pas :',
    areNot:
      'Un oracle. Nous n’affirmons rien de définitif sur l’auteur d’un contenu. L’absence de signal ne prouve pas une origine humaine, et un signal détecté ne prouve pas une génération par machine.',
  },
  openSource: {
    title: 'Libre & open source',
    body: 'AI Inspector est publié sous licence MIT. Pas de compte, pas de quota, pas d’offre payante : juste le code. Issues, traductions et pull requests sont les bienvenues.',
    link: 'Parcourir le code sur GitHub',
  },
  cta: 'Commencer l’inspection',
};
