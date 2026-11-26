import { expoClient } from '@better-auth/expo/client'
import { createAuthClient } from 'better-auth/react'
import * as SecureStore from 'expo-secure-store'

import { API_TIMEOUT_MS, apiUrl } from './api-url'

export const authClient = createAuthClient({
  baseURL: apiUrl,

  // Abandonne les requêtes sans réponse : la session passe alors en erreur au lieu de rester en attente
  fetchOptions: {
    timeout: API_TIMEOUT_MS,
  },

  plugins: [
    expoClient({
      scheme: 'pawpote',
      storagePrefix: 'pawpote',
      storage: SecureStore,
    }),
  ],
})
