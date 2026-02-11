import { ConsoleLogger, LogLevel, MobileSDKOptions, useMobileSDKInitializer } from '@credebl/ssi-mobile-core'
import { DidCommMediatorPickupStrategy, DidCommSDK } from '@credebl/ssi-mobile-didcomm'
import { OpenID4VCSDK } from '@credebl/ssi-mobile-openid4vc'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/core'
import { CommonActions } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View, useWindowDimensions, Image } from 'react-native'
import { Config } from 'react-native-config'
import { SafeAreaView } from 'react-native-safe-area-context'

import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import ProgressBar from '../components/tour/ProgressBar'
import TipCarousel from '../components/tour/TipCarousel'
import { LocalStorageKeys } from '../constants'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Screens, Stacks } from '../types/navigators'
import {
  LoginAttempt as LoginAttemptState,
  Preferences as PreferencesState,
  Onboarding as StoreOnboardingState,
  Tours as ToursState,
} from '../types/state'
import { getDefaultHolderDidDocument, useSdk } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

enum InitErrorTypes {
  Onboarding,
  Agent,
}

export type Modules = {
  openid: OpenID4VCSDK
  didcomm: DidCommSDK
}
const onboardingComplete = (state: StoreOnboardingState): boolean => {
  return state.didCompleteTutorial && state.didAgreeToTerms && state.didCreatePIN && state.didConsiderBiometry
}

const resumeOnboardingAt = (state: StoreOnboardingState, enableWalletNaming: boolean | undefined): Screens => {
  if (
    state.didCompleteTutorial &&
    state.didAgreeToTerms &&
    state.didCreatePIN &&
    (state.didNameWallet || !enableWalletNaming) &&
    !state.didConsiderBiometry
  ) {
    return Screens.WalletOptions
  }

  if (
    state.didCompleteTutorial &&
    state.didAgreeToTerms &&
    state.didCreatePIN &&
    enableWalletNaming &&
    !state.didNameWallet
  ) {
    return Screens.NameWallet
  }

  if (state.didCompleteTutorial && state.didAgreeToTerms && !state.didCreatePIN) {
    return Screens.CreatePIN
  }

  if (state.didCompleteTutorial && !state.didAgreeToTerms) {
    return Screens.Terms
  }

  return Screens.Onboarding
}

/**
 * To customize this splash screen set the background color of the
 * iOS and Android launch screen to match the background color of
 * of this view.
 */
const Splash: React.FC = () => {
  const { width } = useWindowDimensions()
  const { enableWalletNaming } = useConfiguration()
  const [progressPercent, setProgressPercent] = useState(0)
  const [initOnboardingCount, setInitOnboardingCount] = useState(0)
  const [initAgentCount, setInitAgentCount] = useState(0)
  const { sdk } = useSdk()
  const { t } = useTranslation()
  const [stepText, setStepText] = useState<string>(t('Init.Starting'))
  const [initError, setInitError] = useState<Error | null>(null)
  const [initErrorType, setInitErrorType] = useState<InitErrorTypes>(InitErrorTypes.Onboarding)

  const { Assets } = useTheme()
  const [store, dispatch] = useStore()
  const navigation = useNavigation()
  const { getWalletCredentials } = useAuth()
  const { ColorPallet } = useTheme()
  const { initializeSDK, isInitialized } = useMobileSDKInitializer()
  const steps: string[] = [
    t('Init.Starting'),
    t('Init.CheckingAuth'),
    t('Init.FetchingPreferences'),
    t('Init.VerifyingOnboarding'),
    t('Init.GettingCredentials'),
    t('Init.InitializingAgent'),
    t('Init.SettingAgent'),
    t('Init.Finishing'),
  ]

  const setStep = (stepIdx: number) => {
    setStepText(steps[stepIdx])
    const percent = Math.floor(((stepIdx + 1) / steps.length) * 100)
    setProgressPercent(percent)
  }

  const styles = StyleSheet.create({
    screenContainer: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      flex: 1,
    },
    scrollContentContainer: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    progressContainer: {
      alignItems: 'center',
      width: '100%',
    },
    stepTextContainer: {
      marginTop: 10,
    },
    stepText: {
      fontSize: 16,
      color: '#a8abae',
    },
    carouselContainer: {
      width,
      marginVertical: 30,
      flex: 1,
    },
    errorBoxContainer: {
      paddingHorizontal: 20,
    },
    logoContainer: {
      alignSelf: 'center',
      marginBottom: 30,
    },
  })

  async function getTrustedCerts() {
    try {
      // const response = await fetch('https://raw.githubusercontent.com/RinkalBhojani/x509-test-certs/refs/heads/main/trusted-certs.json');
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const data = await response.json();
      // console.log('Success:', data);
      // return data;
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const createConfig = (): MobileSDKOptions<Modules> => ({
    agentConfig: {
      allowInsecureHttpUrls: true,
      logger: new ConsoleLogger(LogLevel.debug),
    },
    askarConfig: {
      id: 'CREDEBL-wallet',
      key: 'CREDEBL-wallet-key',
    },
    modules: {
      didcomm: new DidCommSDK({}),
      openid: new OpenID4VCSDK({
        getTrustedCertificatesForVerification: async (agentContext, { certificateChain, verification }) => {
          const certs: string[] = await getTrustedCerts()
          return certs
        },
      }),
    },
  })

  const loadAuthAttempts = async (): Promise<LoginAttemptState | undefined> => {
    try {
      const attemptsData = await AsyncStorage.getItem(LocalStorageKeys.LoginAttempts)
      if (attemptsData) {
        const attempts = JSON.parse(attemptsData) as LoginAttemptState
        dispatch({
          type: DispatchAction.ATTEMPT_UPDATED,
          payload: [attempts],
        })
        return attempts
      }
    } catch (error) {
      // todo (WK)
    }
  }

  useEffect(() => {
    const initOnboarding = async (): Promise<void> => {
      try {
        setStep(0)
        if (store.authentication.didAuthenticate) {
          return
        }

        setStep(1)
        // load authentication attempts from storage
        const attemptData = await loadAuthAttempts()

        setStep(2)
        const preferencesData = await AsyncStorage.getItem(LocalStorageKeys.Preferences)

        if (preferencesData) {
          const dataAsJSON = JSON.parse(preferencesData) as PreferencesState

          dispatch({
            type: DispatchAction.PREFERENCES_UPDATED,
            payload: [dataAsJSON],
          })
        }

        const toursData = await AsyncStorage.getItem(LocalStorageKeys.Tours)
        if (toursData) {
          const dataAsJSON = JSON.parse(toursData) as ToursState

          dispatch({
            type: DispatchAction.TOUR_DATA_UPDATED,
            payload: [dataAsJSON],
          })
        }

        setStep(3)
        const data = await AsyncStorage.getItem(LocalStorageKeys.Onboarding)
        if (data) {
          const dataAsJSON = JSON.parse(data) as StoreOnboardingState
          dispatch({
            type: DispatchAction.ONBOARDING_UPDATED,
            payload: [dataAsJSON],
          })

          if (onboardingComplete(dataAsJSON) && !attemptData?.lockoutDate) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: Screens.EnterPIN }],
              }),
            )
            return
          }
          if (onboardingComplete(dataAsJSON) && attemptData?.lockoutDate) {
            // return to lockout screen if lockout date is set
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: Screens.AttemptLockout }],
              }),
            )
            return
          }

          // If onboarding was interrupted we need to pickup from where we left off.
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: resumeOnboardingAt(dataAsJSON, enableWalletNaming) }],
            }),
          )

          return
        }

        // We have no onboarding state, starting from step zero.
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Screens.Onboarding }],
          }),
        )
      } catch (e: unknown) {
        setInitErrorType(InitErrorTypes.Onboarding)
        setInitError(e as Error)
      }
    }
    initOnboarding()
  }, [store.authentication.didAuthenticate, initOnboardingCount])

  useEffect(() => {
    const initAgent = async (): Promise<void> => {
      try {
        console.log('🚀 ~ Splash.tsx:295 ~ initAgent ~ store:', JSON.stringify(store))
        // if (!store.authentication.didAuthenticate || !store.onboarding.didConsiderBiometry) {
        //   return
        // }

        setStep(4)
        // const credentials = await getWalletCredentials()
        // console.log("🚀 ~ Splash.tsx:303 ~ initAgent ~ credentials:", credentials)

        // if (!credentials?.id || !credentials.key) {
        //   // Cannot find wallet id/secret
        //   return
        // }

        console.log('🚀 ~ Splash.tsx:11 ~ Config:', Config)
        setStep(5)
        // if (!Config.MEDIATOR_URL) {
        //   throw new Error('Missing mediator URL')
        // }

        const agentConfig = {
          // label: store.preferences.walletName || 'CREDEBL Wallet',
          // walletConfig: {
          //   id: credentials.id,
          //   key: credentials.key,
          // },
          logger: new ConsoleLogger(LogLevel.debug),
          autoUpdateStorageOnStartup: true,
        }

        const newAgent = createConfig()
        console.log('🚀 ~ Splash.tsx:323 ~ initAgent ~ newAgent:', newAgent)
        if (!isInitialized) {
          const sdk = await initializeSDK(newAgent)
          const mediatorUrl = sdk.modules.didcomm.getAgentModules()
          console.log('🚀 ~ Splash.tsx:330 ~ initAgent ~ mediatorUrl:', mediatorUrl)
        }
        console.log('🚀 ~ Splash.tsx:294 ~ initAgent ~ newAgent:', newAgent)

        setStep(6)
        await getDefaultHolderDidDocument(newAgent)
        // setAgent(newAgent)

        setStep(7)
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Stacks.TabStack }],
          }),
        )
      } catch (e: unknown) {
        console.log('🚀 ~ Splash.tsx:341 ~ initAgent ~ e:', e)
        setInitErrorType(InitErrorTypes.Agent)
        setInitError(e as Error)
      }
    }

    initAgent()
  }, [store.authentication.didAuthenticate, store.onboarding.didConsiderBiometry, initAgentCount])

  const handleErrorCallToActionPressed = () => {
    setInitError(null)
    if (initErrorType === InitErrorTypes.Agent) {
      setInitAgentCount(initAgentCount + 1)
    } else {
      setInitOnboardingCount(initOnboardingCount + 1)
    }
  }
  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.progressContainer} testID={testIdWithKey('LoadingActivityIndicator')}>
          <ProgressBar progressPercent={progressPercent} />
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepText}>{stepText}</Text>
          </View>
        </View>
        <View style={styles.carouselContainer}>
          {initError ? (
            <View style={styles.errorBoxContainer}>
              <InfoBox
                notificationType={InfoBoxType.Error}
                title={t('Error.Title2026')}
                description={t('Error.Message2026')}
                message={initError?.message || t('Error.Unknown')}
                onCallToActionLabel={t('Init.Retry')}
                onCallToActionPressed={handleErrorCallToActionPressed}
              />
            </View>
          ) : (
            <TipCarousel />
          )}
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={Assets.img.logoPrimary.src}
            resizeMode={Assets.img.logoPrimary.resizeMode}
            style={{ width: Assets.img.logoPrimary.width, height: Assets.img.logoPrimary.height }}
            testID={testIdWithKey('LoadingActivityIndicatorImage')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Splash
