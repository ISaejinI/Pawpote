// Bibliothèques natives : on passe par leurs versions de test officielles
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'))
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))
jest.mock('react-native-keyboard-controller', () => require('react-native-keyboard-controller/jest'))
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default)

// Reanimated 4.7 charge son initialisation native sous Jest, qui échoue hors d'un téléphone
jest.mock('react-native-reanimated/src/initializers', () => ({ initializeReanimatedModule: () => {} }))
