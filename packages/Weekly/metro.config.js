const { resolve } = require('path')

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    projectRoot: resolve(__dirname, '../../'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: [resolve(__dirname, '.'), resolve(__dirname, '../../packages/common'), resolve(__dirname, '../../')],
};
