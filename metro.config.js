const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const { transformer, resolver } = config;

// Les fichiers .svg sont importés comme composants React (react-native-svg-transformer)
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

module.exports = config;
