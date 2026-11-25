/**
 * Choix Passer / J'aime fait depuis la page de détail d'un chien.
 * La page le dépose ici puis revient en arrière ; la pile de swipe le récupère
 * à son retour au premier plan et joue l'animation de la carte.
 */
export type SwipeDirection = -1 | 1

let pending: { dogId: string; direction: SwipeDirection } | null = null

export function setSwipeIntent(dogId: string, direction: SwipeDirection) {
  pending = { dogId, direction }
}

/** Renvoie le choix en attente pour ce chien (une seule fois), ou `null`. */
export function consumeSwipeIntent(dogId: string): SwipeDirection | null {
  if (pending?.dogId !== dogId) return null
  const { direction } = pending
  pending = null
  return direction
}
