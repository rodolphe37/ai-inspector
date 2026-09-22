"""French translations of the fingerprint catalogue (see ``seed_data.py``).

Keyed by fingerprint id. Any field missing here falls back to English.
"""

FINGERPRINTS_FR: dict[str, dict[str, str]] = {
    "c2pa-content-credentials": {
        "name": "Content Credentials C2PA",
        "coverage": "JPEG, PNG, WebP, AVIF, MP4, PDF, WAV",
        "detection_method": (
            "Lire le magasin de manifestes C2PA intégré, vérifier la chaîne de signature COSE "
            "auprès des listes de confiance connues et contrôler les empreintes des assertions "
            "par rapport au fichier."
        ),
        "description": (
            "Un standard ouvert de provenance signée cryptographiquement. Un manifeste valide "
            "indique qui a produit ou modifié un fichier et comment, y compris l'usage d'outils "
            "d'IA générative. L'absence de manifeste ne prouve rien ; un manifeste présent peut "
            "aussi provenir d'un signataire non fiable."
        ),
    },
    "synthid-text": {
        "name": "SynthID Text",
        "coverage": "Anglais et plusieurs autres langues, selon le modèle",
        "detection_method": (
            "Filigrane par échantillonnage en tournoi : la génération biaise le choix des tokens "
            "via une fonction g pseudo-aléatoire dépendante du contexte. La détection compare la "
            "valeur g moyenne des tokens observés à la distribution nulle."
        ),
        "description": (
            "Un filigrane de texte génératif qui perturbe l'échantillonnage des tokens, afin qu'un "
            "détecteur détenant la clé puisse estimer si un texte vient d'un modèle filigrané. La "
            "robustesse baisse avec les retouches importantes, la paraphrase ou les textes courts. "
            "Seul le détenteur de la clé peut vérifier."
        ),
    },
    "synthid-image": {
        "name": "SynthID (image / audio / vidéo)",
        "coverage": "Sorties des modèles génératifs de Google (Imagen, Lyria, Veo)",
        "detection_method": (
            "Un filigrane imperceptible dans le domaine des pixels ou du spectrogramme, intégré à "
            "la génération ; un détecteur entraîné renvoie une plage de confiance."
        ),
        "description": (
            "Un filigrane invisible propriétaire appliqué aux médias générés par les modèles de "
            "Google. Les tiers ne peuvent pas le vérifier sans le détecteur de Google ; cet outil "
            "indique seulement que cette classe de signal existe."
        ),
    },
    "iptc-digital-source-type": {
        "name": "IPTC Digital Source Type",
        "coverage": "Tout fichier portant des métadonnées IPTC Photo (XMP)",
        "detection_method": (
            "Lire la propriété XMP Iptc4xmpExt:DigitalSourceType et signaler les valeurs telles "
            "que trainedAlgorithmicMedia ou compositeWithTrainedAlgorithmicMedia."
        ),
        "description": (
            "Un vocabulaire contrôlé que de nombreuses plateformes et appareils écrivent dans les "
            "métadonnées d'une image pour déclarer comment elle a été produite, y compris par IA. "
            "Facile à supprimer ou à falsifier : à considérer comme un indice."
        ),
    },
    "unicode-invisible-characters": {
        "provider": "Générique",
        "name": "Marqueurs Unicode invisibles",
        "coverage": "Tout texte Unicode",
        "detection_method": (
            "Rechercher les caractères de largeur nulle (U+200B à U+200D, U+2060, U+FEFF), le bloc "
            "Unicode Tags (U+E0000 à U+E007F), les contrôles bidi et les sélecteurs de variante "
            "inhabituels ; en indiquer le nombre et la position."
        ),
        "description": (
            "Les caractères de largeur nulle et les caractères tag peuvent cacher des données ou "
            "servir de filigrane rudimentaire. Ils apparaissent aussi naturellement (séquences "
            "d'emoji, contrôle des ligatures) : le contexte compte."
        ),
    },
    "homoglyph-substitution": {
        "provider": "Générique",
        "name": "Substitution d'homoglyphes",
        "coverage": "Jeux de caractères confondables latin / cyrillique / grec",
        "detection_method": (
            "Comparer chaque lettre à la table Unicode des caractères confondables ; signaler les "
            "mots latins contenant des sosies cyrilliques ou grecs."
        ),
        "description": (
            "Échanger des caractères visuellement identiques entre alphabets permet de faire "
            "passer des signaux par copier-coller ou de tromper une comparaison de chaînes naïve. "
            "Fréquent dans l'hameçonnage ; parfois utilisé comme filigrane fragile."
        ),
    },
    "kgw-green-list-watermark": {
        "provider": "Kirchenbauer et al. (académique)",
        "name": "Filigrane à liste verte (KGW)",
        "coverage": "Anglais ; tout modèle auquel le schéma est appliqué",
        "detection_method": (
            "Un hachage du token précédent initialise une partition pseudo-aléatoire du "
            "vocabulaire en listes verte et rouge ; la génération favorise les tokens verts. Un "
            "test z sur la proportion de tokens verts donne une p-value."
        ),
        "description": (
            "Le schéma ouvert de référence pour filigraner le texte des LLM. La détection exige le "
            "schéma de hachage et la clé ; la paraphrase et les passages à faible entropie "
            "l'affaiblissent nettement."
        ),
    },
    "ngram-frequency-deviation": {
        "provider": "Indépendant",
        "name": "Écart de fréquence des n-grammes",
        "coverage": "Tables de référence anglaise, française et allemande",
        "detection_method": (
            "Comparaison du χ² entre les fréquences observées des n-grammes de caractères et de "
            "mots et un corpus de référence de la langue ; indique aussi l'entropie de Shannon et "
            "le ratio types/occurrences."
        ),
        "description": (
            "Une sonde statistique indépendante de tout schéma. De forts écarts peuvent signaler "
            "un texte gabarit, des artefacts de traduction ou un filigrane, mais n'identifient "
            "jamais une source à eux seuls."
        ),
    },
    "exif-software-tags": {
        "provider": "Générique",
        "name": "Balises logicielles et IA EXIF / XMP",
        "coverage": "JPEG, PNG, TIFF, WebP, HEIC",
        "detection_method": (
            "Lire l'EXIF (Software, ProcessingSoftware), le XMP (CreatorTool, historique xmpMM) et "
            "les blocs texte PNG ; les comparer aux signatures de générateurs connues (par "
            "exemple 'Stable Diffusion', 'Midjourney', 'DALL·E')."
        ),
        "description": (
            "Les outils d'édition et de génération laissent souvent leur nom dans les métadonnées. "
            "Utile pour corroborer, mais les réseaux sociaux suppriment couramment ces métadonnées "
            "et elles se modifient facilement."
        ),
    },
    "openai-c2pa": {
        "name": "Content Credentials OpenAI",
        "coverage": "Images produites par DALL·E 3 et ChatGPT",
        "detection_method": (
            "Vérifier un manifeste C2PA signé par le certificat d'OpenAI et contrôler que "
            "l'assertion c2pa.actions contient 'created' avec un digitalSourceType génératif."
        ),
        "description": (
            "OpenAI joint des Content Credentials signés aux images de ses modèles. Ils "
            "disparaissent si le fichier est réencodé sans conserver les métadonnées."
        ),
    },
    "adobe-firefly-credentials": {
        "name": "Content Credentials Adobe Firefly",
        "coverage": "Adobe Firefly, fonctions génératives de Photoshop",
        "detection_method": (
            "Vérifier le manifeste C2PA auprès de la liste de confiance d'Adobe ; inspecter les "
            "assertions d'ingrédients à la recherche d'étapes génératives."
        ),
        "description": (
            "Adobe intègre par défaut des Content Credentials aux sorties de Firefly, et en option "
            "aux exports Creative Cloud. S'ils ont été supprimés, on peut aussi les retrouver via "
            "le service Adobe Verify."
        ),
    },
    "legacy-lsb-steganography": {
        "provider": "Générique",
        "name": "Stéganographie LSB (historique)",
        "coverage": "Images sans perte (PNG, BMP)",
        "detection_method": (
            "Analyse du χ² et des paires d'échantillons sur les plans de bits de poids faible pour "
            "détecter des distributions non naturelles."
        ),
        "description": (
            "Cacher une charge utile dans les bits de poids faible des pixels. Facilement détruite "
            "par la recompression et rarement utilisée pour la provenance moderne ; conservée par "
            "souci d'exhaustivité."
        ),
    },
}
