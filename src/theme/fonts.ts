import { BagelFatOne_400Regular } from '@expo-google-fonts/bagel-fat-one';
import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { GochiHand_400Regular } from '@expo-google-fonts/gochi-hand';
import type { FontFamilyDefinition } from 'expo-font';

/**
 * Noms de familles à utiliser dans `fontFamily`.
 * Les fichiers de police sont embarqués dans l'app (aucun appel réseau à l'exécution).
 */
export const fontFamilies = {
  /** Bagel Fat One — titres et noms. */
  display: 'BagelFatOne',
  /** Bricolage Grotesque — interface. */
  body: 'BricolageGrotesque',
  /** Gochi Hand — touches manuscrites. Jamais pour une consigne ou une erreur. */
  hand: 'GochiHand',
} as const;

/**
 * Seules les graisses utilisées par le design system sont chargées.
 * Passé à `useFonts` dans le layout racine.
 */
export const fontDefinitions: FontFamilyDefinition[] = [
  {
    fontFamily: fontFamilies.display,
    fontDefinitions: [{ path: BagelFatOne_400Regular, weight: 400 }],
  },
  {
    fontFamily: fontFamilies.body,
    fontDefinitions: [
      { path: BricolageGrotesque_500Medium, weight: 500 },
      { path: BricolageGrotesque_600SemiBold, weight: 600 },
      { path: BricolageGrotesque_700Bold, weight: 700 },
      { path: BricolageGrotesque_800ExtraBold, weight: 800 },
    ],
  },
  {
    fontFamily: fontFamilies.hand,
    fontDefinitions: [{ path: GochiHand_400Regular, weight: 400 }],
  },
];
