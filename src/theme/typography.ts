import type { TextStyle } from 'react-native';

import { fontFamilies } from './fonts';

/** React Native attend un interlignage absolu : taille × ratio du design system. */
function style(
  fontFamily: string,
  fontSize: number,
  lineHeightRatio: number,
  fontWeight: TextStyle['fontWeight'],
): TextStyle {
  return {
    fontFamily,
    fontSize,
    lineHeight: Math.round(fontSize * lineHeightRatio),
    fontWeight,
  };
}

const { display, body, hand } = fontFamilies;

/** Styles de texte — source : design system « PawPote » (type.groups). */
export const typography = {
  // Display — Bagel Fat One
  /** Logo sur l'écran de chargement. */
  logo: style(display, 52, 1, 400),
  /** Titre de page à onglet. */
  titleXl: style(display, 36, 1, 400),
  /** Titre d'étape d'onboarding, nom dans l'en-tête de profil. */
  titleLg: style(display, 30, 1.05, 400),
  /** Titres de section, nom dans l'en-tête de conversation. */
  titleMd: style(display, 22, 1.1, 400),

  // Interface — Bricolage Grotesque
  /** Bouton principal. */
  button: style(body, 17, 1.2, 800),
  /** Texte courant, saisie dans les champs. */
  body: style(body, 16, 1.35, 500),
  /** Nom dans une ligne de liste. */
  bodyStrong: style(body, 16, 1.3, 800),
  /** Libellés de champs, pastilles. */
  label: style(body, 14, 1.3, 700),
  /** Sous-titres, métadonnées. */
  small: style(body, 13, 1.3, 600),
  /** Heure des messages, étiquettes. Jamais pour une phrase. */
  caption: style(body, 11, 1.2, 700),

  // Manuscrit — Gochi Hand
  /** Sous-titres chaleureux, accroches. */
  handLg: style(hand, 20, 1.15, 400),
  /** Petites touches personnelles, astuces. */
  hand: style(hand, 17, 1.15, 400),
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
