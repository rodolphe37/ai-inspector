import type { howItWorks as en } from '../en/howItWorks';

export const howItWorks: typeof en = {
  title: 'Comment ça marche',
  subtitle:
    'Un pipeline transparent d’analyse d’origine IA : chaque étape est inspectable. Pas de boîte noire, pas de score opaque.',
  steps: {
    normalize: {
      title: 'Normaliser',
      description:
        'Le contenu est lu, son encodage détecté, puis il est normalisé dans une représentation standard pour l’analyse.',
    },
    inspect: {
      title: 'Inspecter',
      description:
        'Le contenu normalisé est examiné couche par couche : caractères Unicode, champs de métadonnées et manifestes C2PA sont extraits et validés.',
    },
    detect: {
      title: 'Détecter',
      description:
        'Les empreintes et schémas de filigrane connus sont comparés au contenu avec leurs méthodes de détection respectives.',
    },
    measure: {
      title: 'Mesurer',
      description:
        'Analyse forensique : pour les images, artefacts de suréchantillonnage dans le domaine fréquentiel et résidu de bruit de capteur ; pour le texte, stylométrie (variabilité, registre, vocabulaire prisé des LLM) calibrée pour l’anglais et le français. Chacune produit un signal pondéré.',
    },
    verdict: {
      title: 'Verdict',
      description:
        'Tous les signaux se combinent en un verdict d’origine IA avec sa base de confiance (cryptographique pour un manifeste signé, métadonnées ou estimation forensique), et chaque signal contributeur est listé.',
    },
    clean: {
      title: 'Nettoyer',
      description:
        'En option, les artefacts sans risque comme les caractères invisibles et les métadonnées peuvent être retirés du contenu.',
    },
  },
  limits: {
    title: 'Ce que nous pouvons détecter… ou pas',
    subtitle: 'La transparence sur les capacités est essentielle. Voici une évaluation honnête.',
  },
  can: {
    title: 'Peut détecter',
    items: [
      'Une génération IA déclarée dans des Content Credentials C2PA signés (quasi certain)',
      'Les métadonnées de générateur (Stable Diffusion, Midjourney, Firefly…) et les balises IA IPTC',
      'Les artefacts forensiques de diffusion / GAN dans les images (analyse fréquentielle + bruit)',
      'La stylométrie typique des LLM dans les textes anglais et français (estimation statistique)',
      'L’Unicode invisible, les homoglyphes et les marqueurs de filigrane connus',
    ],
  },
  cannot: {
    title: 'Ne peut pas garantir',
    items: [
      'Qu’un contenu sans signal soit d’origine humaine (les signaux sont souvent effacés)',
      'Des verdicts fiables sur des textes courts, retouchés, traduits ou écrits par des non-natifs',
      'La détection de tous les générateurs ou d’un filigrane sur mesure / supprimé',
      'Un verdict sans niveau de confiance explicite (les estimations sont signalées comme telles)',
    ],
  },
  disclaimer:
    'Un verdict cryptographique (Content Credentials signés) fait autorité. Un verdict forensique ou fondé sur les métadonnées est une estimation : l’absence de signal n’est pas une preuve d’origine humaine, et les estimations statistiques se trompent sur les contenus retouchés ou non natifs. Chaque verdict indique de quel type il est.',
  cta: 'Essayer maintenant',
};
