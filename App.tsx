/* eslint-disable @typescript-eslint/no-var-requires */
// global.Buffer = require('buffer').Buffer

import { MobileSDKProvider, W3cCredentialRecordProvider } from '@credebl/ssi-mobile-core'
import { DidCommSDK } from '@credebl/ssi-mobile-didcomm'
import { OpenID4VCSDK } from '@credebl/ssi-mobile-openid4vc'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { ReactNode, useEffect, useMemo } from 'react'
import { StatusBar } from 'react-native'
import { Config } from 'react-native-config'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

import { animatedComponents } from './app/animated-components'
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
import { useSdk } from './app/utils/agent'

initLanguages(translationResources)

function SDKProviders({ children }: { children: ReactNode }) {
  const { sdk } = useSdk()

  if (!sdk?.agent) {
    return <>{children}</>
  }

  return (
    <DidCommSDK.DidCommProvider agent={sdk.agent}>
      <OpenID4VCSDK.OpenIDProvider agent={sdk.agent}>
        <W3cCredentialRecordProvider agent={sdk.agent}>{children}</W3cCredentialRecordProvider>
      </OpenID4VCSDK.OpenIDProvider>
    </DidCommSDK.DidCommProvider>
  )
}
const App = () => {
  useMemo(() => {
    initStoredLanguage().then()
  }, [])

  useEffect(() => {
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
      <MobileSDKProvider>
        <ThemeProvider value={theme}>
          <SDKProviders>
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
                      {/* <PushNotifications /> */}
                    </NetworkProvider>
                  </AuthProvider>
                </CommonUtilProvider>
              </ConfigurationProvider>
            </AnimatedComponentsProvider>
          </SDKProviders>
        </ThemeProvider>
      </MobileSDKProvider>
    </StoreProvider>
  )
}

export default App
