/**
 * Palette PawPote — source : design system « PawPote » (tokens.json).
 * Thème clair uniquement : le design system ne définit pas de thème sombre.
 */
export const palette = {
  /** Encre : texte, contours et ombres décalées. 15:1 sur cream. */
  ink: '#1E1240',
  /** Texte secondaire, sur cream ou white uniquement (6,9:1 sur cream). */
  inkMuted: '#5C5078',
  /** Texte d'exemple des champs, sur white uniquement (5,6:1). */
  inkPlaceholder: '#6B5F8A',

  /** Surface des boîtes de contenu (cartes, en-têtes, tapbar, modale). */
  cream: '#FFF8EC',
  /** Intérieur des champs, bulles reçues, contour blanc des stickers. */
  white: '#FFFFFF',

  /** Fond principal des écrans (sous le motif de vagues). */
  lavender100: '#D6CCFF',
  /** Emplacements photo, bulles envoyées, pastilles d'infos, fond de recherche. */
  lavender200: '#C9BCFF',
  /** Traits du motif de vagues. Décor uniquement, jamais pour du texte. */
  lavender300: '#BCA9FF',
  /** États actifs : onglet actif, choix sélectionné, barre de complétion. Texte ink dessus (4,9:1). */
  lavender500: '#8F77EF',

  /** Accent profond pour les grandes surfaces illustratives ; texte white dessus (5,8:1). */
  majorelle500: '#7B46F8',
  /** Liens texte et coches « lu » sur cream ou white. */
  violet700: '#5A33D6',

  /** Action principale (Continuer, Enregistrer, Envoyer), encarts positifs. Texte ink dessus. */
  lime500: '#D9FB5F',

  /** Stickers de race, étiquette « À compléter », traits de caractère sélectionnés. */
  pink300: '#FF99DC',
  /** Bouton Passer. */
  pink500: '#FF66A9',
  /** Emplacement de la photo principale du chien. */
  peach300: '#FFC7A6',
  /** Sticker d'âge, bouton J'aime. */
  orange500: '#FE8616',
  /** Logo patte, icônes de la tapbar, pastille de non-lus (chiffre white 12 px gras uniquement). */
  mandarin600: '#EB4B11',
  /** Actions destructrices en texte sur cream (5,6:1). */
  danger700: '#B8350A',
  /** Éclat jaune de l'icône Match. Illustration uniquement. */
  sun400: '#FFD23F',
  /** Fond des champs facultatifs encore vides. */
  missing50: '#FFF1F8',
} as const;

/**
 * Alias sémantiques : à utiliser en priorité dans les composants,
 * `palette` restant là pour les cas illustratifs ou ponctuels.
 */
export const colors = {
  ...palette,

  text: palette.ink,
  textMuted: palette.inkMuted,
  placeholder: palette.inkPlaceholder,
  link: palette.violet700,

  background: palette.lavender100,
  backgroundPattern: palette.lavender300,
  surface: palette.cream,
  field: palette.white,

  border: palette.ink,
  shadow: palette.ink,

  primary: palette.lime500,
  active: palette.lavender500,
  pass: palette.pink500,
  like: palette.orange500,
  danger: palette.danger700,
} as const;

export type ColorName = keyof typeof colors;
