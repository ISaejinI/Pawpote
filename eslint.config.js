// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Le design system et les outils transverses ne connaissent ni les écrans ni les fonctionnalités :
    // les dépendances vont toujours de `app/` vers `features/`, puis vers `components/ui` et `lib/`.
    files: ['src/components/ui/**', 'src/lib/**', 'src/theme/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app/*', '@/features/*'],
          message: 'components/ui, lib et theme ne doivent pas dépendre des écrans ni des fonctionnalités.',
        }],
      }],
    },
  },
]);
