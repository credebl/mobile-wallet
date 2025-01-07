/* eslint-disable @typescript-eslint/no-var-requires */
global.Buffer = require('buffer').Buffer

import { AdeyaAgentProvider } from '@adeya/ssi'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import * as React from 'react'
import { useEffect, useMemo } from 'react'
import { StatusBar } from 'react-native'
import { Config } from 'react-native-config'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

import { animatedComponents } from './app/animated-components'
import { OpenIDCredentialRecordProvider } from './app/components/Provider/OpenIDCredentialRecordProvider'
import PushNotifications from './app/components/PushNotifications'
import ErrorModal from './app/components/modals/ErrorModal'
import NetInfo from './app/components/network/NetInfo'
import toastConfig from './app/components/toast/ToastConfig'
import { homeTourSteps } from './app/components/tour/HomeTourSteps'
import { AnimatedComponentsProvider } from './app/contexts/animated-components'
import { AuthProvider } from './app/contexts/auth'
import { CommonUtilProvider } from './app/contexts/commons'
import { ConfigurationProvider } from './app/contexts/configuration'
import { NetworkProvider } from './app/contexts/network'
import { StoreProvider } from './app/contexts/store'
import { ThemeProvider } from './app/contexts/theme'
import { TourProvider } from './app/contexts/tour/tour-provider'
import { defaultConfiguration } from './app/defaultConfiguration'
import { initLanguages, initStoredLanguage, translationResources } from './app/localization'
import RootStack from './app/navigators/RootStack'
import { theme } from './app/theme'

initLanguages(translationResources)

const App = () => {
  useMemo(() => {
    initStoredLanguage().then()
  }, [])

  useEffect(() => {
    // Hide the native splash / loading screen so that our
    // RN version can be displayed
    SplashScreen.hide()

    if (Config.GOOGLE_WEB_CLIENT_ID && Config.GOOGLE_IOS_CLIENT_ID) {
      GoogleSignin.configure({
        webClientId: Config.GOOGLE_WEB_CLIENT_ID,
        iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
        offlineAccess: true,
        scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata'],
      })
    }
  }, [])

  return (
    <StoreProvider>
      <AdeyaAgentProvider>
        <OpenIDCredentialRecordProvider>
          <ThemeProvider value={theme}>
            <AnimatedComponentsProvider value={animatedComponents}>
              <ConfigurationProvider value={defaultConfiguration}>
                <CommonUtilProvider>
                  <AuthProvider>
                    <NetworkProvider>
                      <StatusBar
                        hidden={false}
                        barStyle="light-content"
                        backgroundColor={theme.ColorPallet.brand.primary}
                        translucent={false}
                      />
                      <NetInfo />
                      <ErrorModal />
                      <TourProvider steps={homeTourSteps} overlayColor={'gray'} overlayOpacity={0.7}>
                        <RootStack />
                      </TourProvider>
                      <Toast topOffset={15} config={toastConfig} />
                      <PushNotifications />
                    </NetworkProvider>
                  </AuthProvider>
                </CommonUtilProvider>
              </ConfigurationProvider>
            </AnimatedComponentsProvider>
          </ThemeProvider>
        </OpenIDCredentialRecordProvider>
      </AdeyaAgentProvider>
    </StoreProvider>
  )
}

export default App
