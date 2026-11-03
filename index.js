// Hermes doesn't provide TextEncoder/TextDecoder, which the OID4VC DPoP
// (proof-of-possession) crypto path requires - without this the app crashes
// with "ReferenceError: Property 'TextEncoder' doesn't exist" during OID4VCI
// credential acquisition. Must run before any other import. CredentialDetailsW3C.tsx
// already pulls in 'text-encoding' locally, but only once that screen has
// mounted - this polyfill needs to exist from app startup, since OID4VC
// credential acquisition can happen before the user ever opens that screen.
if (typeof TextEncoder === 'undefined' || typeof TextDecoder === 'undefined') {
  require('text-encoding')
}

// eslint-disable-next-line import/order
import { install } from 'react-native-quick-crypto'
install() // Polyfills global.crypto (including crypto.subtle) and global.Buffer
// import '@ethersproject/shims'
import 'react-native-gesture-handler'
import 'react-native-url-polyfill/auto'
import 'react-native-quick-base64'

import '@formatjs/intl'
//TODO: we will remove latter
// import '@formatjs/intl-getcanonicallocales/polyfill'
// import '@formatjs/intl-locale/polyfill'
// import '@formatjs/intl-pluralrules/polyfill'
// import '@formatjs/intl-pluralrules/locale-data/en' // locale-data for en
// import '@formatjs/intl-displaynames/polyfill'
// import '@formatjs/intl-displaynames/locale-data/en' // locale-data for en
// import '@formatjs/intl-listformat/polyfill'
// import '@formatjs/intl-listformat/locale-data/en' // locale-data for en
// import '@formatjs/intl-numberformat/polyfill'
// import '@formatjs/intl-numberformat/locale-data/en' // locale-data for en
// import '@formatjs/intl-relativetimeformat/polyfill'
// import '@formatjs/intl-relativetimeformat/locale-data/en' // locale-data for en
// import '@formatjs/intl-datetimeformat/polyfill'
// import '@formatjs/intl-datetimeformat/locale-data/en' // locale-data for en
// import '@formatjs/intl-datetimeformat/add-all-tz' // Add ALL tz data
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import * as React from 'react'
import { AppRegistry, LogBox } from 'react-native'

import App from './App.tsx'
import { NavigationTheme } from './app/theme.ts'
import { name as appName } from './app.json'

const navigationTheme = {
  ...NavigationTheme,
}

LogBox.ignoreAllLogs()

const Base = () => {
  const navigationRef = useNavigationContainerRef()
  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <App />
    </NavigationContainer>
  )
}

AppRegistry.registerComponent(appName, () => Base)
