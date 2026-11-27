/** Tests unitaires et de composants de l'app (`npm test`). Les tests d'API vivent dans `server/`. */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/src/**/*.test.{ts,tsx}', '**/shared/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/server/'],
  setupFiles: ['<rootDir>/test/env.ts', 'react-native-gesture-handler/jestSetup'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    // Metro transforme les icônes SVG en composants ; Jest les remplace par un composant vide.
    // Avant les alias, qui sinon renverraient le fichier SVG brut.
    '\\.svg$': '<rootDir>/test/svg-mock.tsx',
    // Même alias que dans tsconfig.json : `@/assets` vise le dossier racine, pas `src/`
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    // Types et règles partagés avec le serveur
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
};
