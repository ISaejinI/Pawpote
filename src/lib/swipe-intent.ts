/**
 * Choix Passer / J'aime fait depuis la page de détail d'un chien.
 * Après confirmation par l'API, la fiche revient à la pile, qui joue
 * l'animation sans envoyer le choix une seconde fois.
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
