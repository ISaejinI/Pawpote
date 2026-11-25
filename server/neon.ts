import { defineConfig } from '@neon/config/v1'

export default defineConfig({
  functions: {
    pawpote: {
      name: 'Pawpote API',
      source: './src/index.ts',
      dev: { port: 8787 },
      env: {
        BETTER_AUTH_SECRET: { value: process.env.BETTER_AUTH_SECRET, required: true },
        BETTER_AUTH_URL: { value: process.env.BETTER_AUTH_URL, required: false },
        BETTER_AUTH_WEB_ORIGINS: { value: process.env.BETTER_AUTH_WEB_ORIGINS, required: false },
        BETTER_AUTH_EXPO_GO: { value: process.env.BETTER_AUTH_EXPO_GO, required: false },
      },
    },
  },
})
