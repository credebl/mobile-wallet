/* eslint-disable */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const exclusionList = require('metro-config/private/defaults/exclusionList').default

const defaultConfig = getDefaultConfig(__dirname)
const { assetExts, sourceExts } = defaultConfig.resolver

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    unstable_enablePackageExports: true,
    // Without Watchman installed, Metro falls back to watching every
    // directory individually via inotify, which blows past the OS fs
    // watcher limit on native Android/iOS build output (lots of generated
    // dirs under build/.cxx). Excluding those avoids needing to raise
    // fs.inotify.max_user_watches system-wide.
    blockList: exclusionList([
      /android\/(app\/)?build\/.*/,
      /android\/\.cxx\/.*/,
      /android\/\.gradle\/.*/,
      /ios\/build\/.*/,
      /ios\/Pods\/.*/,
    ]),
  },
}

module.exports = mergeConfig(defaultConfig, config)
