import { palette } from './colors';

/** Échelle d'espacement (px) — `space-N` dans le design system. */
export const spacing = {
  1: 4, // écart icône / texte serré
  2: 8, // entre pastilles, entre bulles d'une même personne
  3: 12, // écart icône / libellé dans une ligne
  4: 16, // marge latérale des écrans, padding des cartes
  5: 20, // entre blocs d'une page
  6: 24, // entre sections d'une page à onglet
  8: 32, // respiration autour des grands titres
} as const;

/** Rayons d'arrondi (px). */
export const radius = {
  /** Tuiles d'icône dans les lignes, champ de recherche dans une liste. */
  sm: 12,
  /** Champs, petites photos, boutons de choix. */
  md: 16,
  /** Groupes de lignes, encarts, en-tête. */
  lg: 22,
  /** Cartes principales, tapbar, haut de la modale. */
  xl: 28,
  /** Boutons, pastilles, badges, stickers d'info. */
  pill: 999,
} as const;

/** Épaisseurs de contour (px). */
export const borderWidth = {
  /** Pastilles, bulles, lignes internes. */
  thin: 2,
  /** Contour standard des boîtes, champs et boutons. */
  regular: 2.5,
  /** Contour blanc des stickers. */
  sticker: 3,
} as const;

/**
 * Ombres pleines décalées vers le bas à droite, jamais de flou.
 * `boxShadow` est géré nativement sur iOS et Android (New Architecture).
 */
export const shadows = {
  /** Petits boutons d'action (Enregistrer, Envoyer), bulles envoyées. */
  sm: { boxShadow: `3px 3px 0 ${palette.ink}` },
  /** Boutons principaux, groupes de lignes, boutons ronds. */
  md: { boxShadow: `4px 4px 0 ${palette.ink}` },
  /** Cartes principales (carte de match, formulaire). */
  lg: { boxShadow: `6px 6px 0 ${palette.ink}` },
  /** Fin contour ink autour du contour blanc des stickers. */
  sticker: { boxShadow: `0 0 0 2px ${palette.ink}` },
} as const;
