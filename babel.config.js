module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin', '@babel/plugin-transform-export-namespace-from'],
  overrides: [
    {
      test: './node_modules/ethers',
      plugins: [['@babel/plugin-transform-private-methods', { loose: true }]],
    },
  ],
}
