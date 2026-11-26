import { usePreventRemove } from 'expo-router'
import { useState } from 'react'
import { Alert } from 'react-native'

/**
 * Demande confirmation avant de quitter un écran aux modifications non enregistrées
 * (bouton retour, geste ou retour Android).
 * Renvoie la fonction qui lève le blocage : à appeler juste avant de quitter après un enregistrement.
 */
export function useLeaveConfirmation(dirty: boolean) {
  // Départ confirmé : le retour n'est plus bloqué
  const [leaving, setLeaving] = useState(false)

  return usePreventRemove(dirty && !leaving, ({ repeat }) => {
    Alert.alert('Quitter sans enregistrer ?', 'Tes modifications seront perdues.', [
      { text: 'Rester', style: 'cancel' },
      {
        text: 'Quitter',
        style: 'destructive',
        onPress: () => {
          setLeaving(true)
          repeat()
        },
      },
    ])
  })
}
