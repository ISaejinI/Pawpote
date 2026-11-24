import { betterAuth } from 'better-auth'
import { expo } from '@better-auth/expo'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [expo()],
})