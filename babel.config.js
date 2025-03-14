module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
  overrides: [
    {
      test: './node_modules/ethers',
      plugins: [['@babel/plugin-transform-private-methods', { loose: true }]],
    },
  ],
}
