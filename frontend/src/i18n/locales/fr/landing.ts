import type { landing as en } from '../en/landing';

export const landing: typeof en = {
  hero: {
    badge: 'Analyse d’origine IA & de provenance',
    title: 'Est-ce que ça a été fait par une IA ?',
    subtitle:
      'Une analyse d’origine IA pour le texte, le code et les images : Content Credentials cryptographiques, métadonnées de générateur, marqueurs de filigrane et détection forensique. Chaque verdict est accompagné de ses preuves et d’un niveau de confiance honnête.',
    cta: 'Analyser un contenu',
    secondary: 'Comment ça marche',
    tags: 'Gratuit · Open source · Dans le navigateur · Sans LLM · Chaque verdict montre ses preuves',
  },
  demo: {
    title: 'Démo en direct',
    subtitle:
      'Une vraie analyse exécutée dans votre navigateur : estimation d’origine IA et signaux de provenance. Modifiez le texte et lancez-la.',
    input: 'ENTRÉE',
    output: 'SORTIE',
    plaintext: 'texte brut',
    analyzing: 'Analyse…',
    run: 'Analyser la démo',
    preview: 'aperçu · pipeline complet dans l’app',
    empty: 'Les résultats s’afficheront ici après l’analyse',
    steps: ['Normalisation', 'Inspection Unicode', 'Recherche d’empreintes'],
    sample:
      "Dans un monde où le paysage numérique est en constante évolution, comprendre la provenance de l'information est devenu crucial. Il est important de noter que l'attribution des contenus joue un rôle clé dans la confiance accordée aux médias. En outre, en tirant parti de cadres d'analyse robustes, les organisations peuvent naviguer dans la complexité d'un environnement en pleine mutation. Par ailleurs, cette approche holistique souligne l'importance de la transparence et de la responsabilité. De surcroît, les parties prenantes sont mieux armées pour prendre des décisions éclairées. En conclusion, l'analyse de provenance constitue une véritable pierre angulaire qui continuera de façonner l'avenir de la vérification des contenus numériques.",
    rows: {
      ai: 'Estimation d’origine IA',
      aiTooShort: 'échantillon trop court pour une estimation stylométrique',
      lowReliability: ' (fiabilité faible)',
      invisible: 'Unicode invisible',
      invisibleFound: '{{count}} caractère(s)',
      homoglyphs: 'Homoglyphes',
      homoglyphsFound: '{{count}} lettre(s) d’un autre alphabet',
      none: 'aucun détecté',
      letters: 'Distribution des lettres',
      lettersDetail: 'χ²={{chi2}} · entropie {{entropy}} bits/car.',
    },
  },
  why: {
    badge: 'Des preuves, pas une boîte noire',
    title: 'Une autre approche de la détection d’IA',
    cards: {
      inspect: {
        title: 'Inspecter',
        description:
          'Métadonnées, Unicode, provenance, signatures. Examinez les couches techniques d’un contenu numérique.',
      },
      measure: {
        title: 'Mesurer',
        description:
          'Statistiques, probabilités et signaux connus. Quantifiez ce que vous observez avec des métriques transparentes.',
      },
      explain: {
        title: 'Expliquer',
        description:
          'Chaque résultat est accompagné d’une explication technique. Pas de boîte noire, pas de score opaque.',
      },
    },
  },
  pipeline: {
    title: 'Pipeline d’analyse',
    subtitle: 'Le parcours d’un contenu dans le moteur d’inspection',
    steps: {
      content: 'Contenu',
      normalization: 'Normalisation',
      engine: 'Moteur d’analyse',
      unicode: 'Unicode',
      metadata: 'Métadonnées',
      c2pa: 'C2PA',
      statistics: 'Tests statistiques',
      fingerprints: 'Empreintes connues',
      report: 'Rapport',
    },
  },
  privacy: {
    badge: 'La confidentialité d’abord',
    title: 'Votre contenu doit rester le vôtre.',
    body: 'AI Inspector analyse tout dans votre navigateur. Aucun contenu n’est envoyé à un serveur. Aucun LLM n’intervient. Pas de compte, pas de pistage, pas d’entraînement sur vos données.',
    items: [
      'Analyse 100 % dans votre navigateur',
      'Aucun LLM impliqué',
      'Aucun entraînement sur les données des utilisateurs',
      'Ni compte ni pistage',
      'L’historique reste sur votre appareil',
      'Open source, vérifiable de bout en bout',
    ],
    diagram: {
      browser: 'Navigateur',
      local: 'Analyse locale',
      report: 'Rapport',
      backend: 'Aucun serveur applicatif : tout est intégré à l’application',
    },
  },
  cta: {
    title: 'Commencez à inspecter vos contenus',
    body: 'Libre et open source : sans compte, sans limite. Tout le pipeline d’analyse tourne dans votre navigateur.',
    button: 'Lancer l’application',
  },
};
