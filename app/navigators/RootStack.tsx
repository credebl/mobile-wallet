import { deleteConnectionRecordById, ProofState, useProofByState } from '@adeya/ssi'
import { useNavigation } from '@react-navigation/core'
import { createStackNavigator, StackCardStyleInterpolator, StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'
import Toast from 'react-native-toast-message'

import { ProofCustomMetadata, ProofMetadata } from '../../verifier'
import { ToastType } from '../components/toast/BaseToast'
import { walletTimeout } from '../constants'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useDeepLinks } from '../hooks/deep-links'
import AttemptLockout from '../screens/AttemptLockout'
import CreateWallet from '../screens/CreateWallet'
import Developer from '../screens/Developer'
import ImportWalletVerify from '../screens/ImportWalletConfirmation'
import NameWallet from '../screens/NameWallet'
import Onboarding from '../screens/Onboarding'
import { createCarouselStyle } from '../screens/OnboardingPages'
import PINCreate from '../screens/PINCreate'
import PINEnter from '../screens/PINEnter'
import { AuthenticateStackParams, Screens, Stacks } from '../types/navigators'
import { useAppAgent } from '../utils/agent'
import {
  checkIfAlreadyConnected,
  connectFromInvitation,
  fetchUrlData,
  getJson,
  getUrl,
  isValidUrl,
  receiveMessageFromUrlRedirect,
} from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import ConnectStack from './ConnectStack'
import ContactStack from './ContactStack'
import DeliveryStack from './DeliveryStack'
import HistoryStack from './HistoryStack'
import NotificationStack from './NotificationStack'
import ProofRequestStack from './ProofRequestStack'
import SettingStack from './SettingStack'
import TabStack from './TabStack'
import { createDefaultStackOptions } from './defaultStackOptions'

const RootStack: React.FC = () => {
  const [state, dispatch] = useStore()
  const { removeSavedWalletSecret } = useAuth()
  const { agent } = useAppAgent()
  const appState = useRef(AppState.currentState)
  const [backgroundTime, setBackgroundTime] = useState<number | undefined>(undefined)
  const [prevAppStateVisible, setPrevAppStateVisible] = useState<string>('')
  const [appStateVisible, setAppStateVisible] = useState<string>('')
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const OnboardingTheme = theme.OnboardingTheme
  const { pages, terms, splash, useBiometry, enableWalletNaming } = useConfiguration()
  useDeepLinks()

  // remove connection on mobile verifier proofs if proof is rejected regardless of if it has been opened
  const declinedProofs = useProofByState([ProofState.Declined, ProofState.Abandoned])
  useEffect(() => {
    declinedProofs.forEach(proof => {
      const meta = proof?.metadata?.get(ProofMetadata.customMetadata) as ProofCustomMetadata
      if (meta?.delete_conn_after_seen) {
        deleteConnectionRecordById(agent, proof?.connectionId ?? '').catch(() => {})

        proof?.metadata.set(ProofMetadata.customMetadata, { ...meta, delete_conn_after_seen: false })
      }
    })
  }, [declinedProofs, state.preferences.useDataRetention])

  const lockoutUser = async () => {
    if (agent && state.authentication.didAuthenticate) {
      // make sure agent is shutdown so wallet isn't still open
      removeSavedWalletSecret()
      await agent.wallet.close()
      await agent.shutdown()
      dispatch({
        type: DispatchAction.DID_AUTHENTICATE,
        payload: [{ didAuthenticate: false }],
      })
      dispatch({
        type: DispatchAction.LOCKOUT_UPDATED,
        payload: [{ displayNotification: true }],
      })
    }
  }

  // handle deeplink events
  useEffect(() => {
    async function handleDeepLink(deepLink: string) {
      let invitationUrl = deepLink
      try {
        if (invitationUrl.includes('?url=')) {
          const parts = invitationUrl.split('=')
          invitationUrl = parts[1]
        }

        // check if connection already exists
        const isAlreadyConnected = await checkIfAlreadyConnected(agent, invitationUrl)

        if (isAlreadyConnected) {
          Toast.show({
            type: ToastType.Warn,
            text1: t('Contacts.AlreadyConnected'),
          })
          return
        }

        // Try connection based
        const { connectionRecord, outOfBandRecord } = await connectFromInvitation(agent, invitationUrl)
        navigation.navigate(Stacks.ConnectionStack as any, {
          screen: Screens.Connection,
          params: { connectionId: connectionRecord?.id, outOfBandId: outOfBandRecord.id },
        })
      } catch {
        try {
          const json = getJson(invitationUrl)
          if (json) {
            await agent?.receiveMessage(json)
            navigation.getParent()?.navigate(Stacks.ConnectionStack, {
              screen: Screens.Connection,
              params: { threadId: json['@id'] },
            })
            return
          }

          const urlData = await fetchUrlData(invitationUrl)
          const isValidURL = isValidUrl(urlData)

          if (isValidURL) {
            const isAlreadyConnected = await checkIfAlreadyConnected(agent, urlData)

            if (isAlreadyConnected) {
              Toast.show({
                type: ToastType.Warn,
                text1: t('Contacts.AlreadyConnected'),
              })
              navigation.goBack()
              return
            }

            const { connectionRecord, outOfBandRecord } = await connectFromInvitation(agent, urlData)

            navigation.getParent()?.navigate(Stacks.ConnectionStack, {
              screen: Screens.Connection,
              params: { connectionId: connectionRecord?.id, outOfBandId: outOfBandRecord.id },
            })
            return
          }
          // if scanned value is url -> receive message from it

          const url = getUrl(invitationUrl)

          if (url) {
            const message = await receiveMessageFromUrlRedirect(invitationUrl, agent)
            navigation.getParent()?.navigate(Stacks.ConnectionStack, {
              screen: Screens.Connection,
              params: { threadId: message['@id'] },
            })
            return
          }
        } catch (error) {
          // TODO:(am add error handling here)
        }
      }

      // set deep link as inactive
      dispatch({
        type: DispatchAction.ACTIVE_DEEP_LINK,
        payload: [undefined],
      })
    }
    if (agent && state.deepLink.activeDeepLink && state.authentication.didAuthenticate) {
      handleDeepLink(state.deepLink.activeDeepLink)
    }
  }, [agent, state.deepLink.activeDeepLink, state.authentication.didAuthenticate])

  useEffect(() => {
    AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        //update time that app gets put in background
        setBackgroundTime(Date.now())
      }

      setPrevAppStateVisible(appState.current)
      appState.current = nextAppState
      setAppStateVisible(appState.current)
    })
  }, [])

  useEffect(() => {
    if (appStateVisible.match(/active/) && prevAppStateVisible.match(/inactive|background/) && backgroundTime) {
      // prevents the user from being locked out during metro reloading
      setPrevAppStateVisible(appStateVisible)
      //lock user out after 5 minutes
      if (walletTimeout && backgroundTime && Date.now() - backgroundTime > walletTimeout) {
        lockoutUser()
      }
    }
  }, [appStateVisible, prevAppStateVisible, backgroundTime])

  const onTutorialCompleted = () => {
    dispatch({
      type: DispatchAction.DID_COMPLETE_TUTORIAL,
    })
    navigation.navigate(Screens.Terms)
  }

  const onAuthenticated = (status: boolean): void => {
    if (!status) {
      return
    }

    dispatch({
      type: DispatchAction.DID_AUTHENTICATE,
    })
  }

  const authStack = () => {
    const Stack = createStackNavigator()

    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Splash} component={splash} />
        <Stack.Screen
          name={Screens.EnterPIN}
          options={() => ({
            title: t('Screens.EnterPIN'),
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}>
          {props => <PINEnter {...props} setAuthenticated={onAuthenticated} />}
        </Stack.Screen>
        <Stack.Screen
          name={Screens.ImportWalletVerify}
          options={() => ({
            title: t('Screens.NameWallet'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={ImportWalletVerify}
        />

        <Stack.Screen
          name={Screens.AttemptLockout}
          component={AttemptLockout}
          options={{ headerShown: true, headerLeft: () => null }}></Stack.Screen>
      </Stack.Navigator>
    )
  }

  const mainStack = () => {
    const Stack = createStackNavigator()

    // This function is to make the fade in behavior of both iOS and Android consistent for the settings menu
    const forFade: StackCardStyleInterpolator = ({ current }) => ({
      cardStyle: {
        opacity: current.progress,
      },
    })

    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Splash} component={splash} />
        <Stack.Screen name={Stacks.TabStack} component={TabStack} />
        <Stack.Screen
          name={Stacks.ConnectStack}
          component={ConnectStack}
          // below is part of the temporary gating of the new scan screen tabs feature
          options={{ presentation: state.preferences.useConnectionInviterCapability ? 'card' : 'modal' }}
        />
        <Stack.Screen
          name={Stacks.SettingStack}
          component={SettingStack}
          options={{
            cardStyleInterpolator: forFade,
          }}
        />
        <Stack.Screen name={Stacks.ContactStack} component={ContactStack} />
        <Stack.Screen name={Stacks.NotificationStack} component={NotificationStack} />
        <Stack.Screen name={Stacks.ConnectionStack} component={DeliveryStack} />
        <Stack.Screen name={Stacks.ProofRequestsStack} component={ProofRequestStack} />
        <Stack.Screen name={Stacks.HistoryStack} component={HistoryStack} />
      </Stack.Navigator>
    )
  }

  const onboardingStack = () => {
    const Stack = createStackNavigator()
    const carousel = createCarouselStyle(OnboardingTheme)
    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Splash} component={splash} />
        <Stack.Screen
          name={Stacks.ConnectStack}
          component={ConnectStack}
          // below is part of the temporary gating of the new scan screen tabs feature
          options={{ presentation: state.preferences.useConnectionInviterCapability ? 'card' : 'modal' }}
        />
        <Stack.Screen
          name={Screens.Onboarding}
          options={() => ({
            title: t('Screens.Onboarding'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            gestureEnabled: false,
            headerLeft: () => false,
          })}>
          {props => (
            <Onboarding
              {...props}
              nextButtonText={t('Global.Next')}
              previousButtonText={t('Global.Back')}
              pages={pages(onTutorialCompleted, OnboardingTheme)}
              style={carousel}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={Screens.Terms}
          options={() => ({
            title: t('Screens.Terms'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={terms}
        />
        <Stack.Screen
          name={Screens.CreatePIN}
          options={() => ({
            title: t('Screens.CreatePIN'),
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}>
          {props => <PINCreate {...props} setAuthenticated={onAuthenticated} />}
        </Stack.Screen>
        <Stack.Screen
          name={Screens.NameWallet}
          options={() => ({
            title: t('Screens.NameWallet'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={NameWallet}
        />
        <Stack.Screen
          name={Screens.ImportWalletVerify}
          options={() => ({
            title: t('Screens.VerifyPhrase'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={ImportWalletVerify}
        />
        <Stack.Screen
          name={Screens.WalletOptions}
          options={() => ({
            title: t('Screens.CreateWallet'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={CreateWallet}
        />
        <Stack.Screen
          name={Screens.UseBiometry}
          options={() => ({
            title: t('Screens.Biometry'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={useBiometry}
        />
        <Stack.Screen
          name={Screens.Developer}
          component={Developer}
          options={{ ...defaultStackOptions, title: t('Screens.Developer'), headerBackTestID: testIdWithKey('Back') }}
        />
      </Stack.Navigator>
    )
  }

  if (
    state.onboarding.didAgreeToTerms &&
    state.onboarding.didCompleteTutorial &&
    state.onboarding.didCreatePIN &&
    (!enableWalletNaming || state.onboarding.didNameWallet) &&
    state.onboarding.didConsiderBiometry
  ) {
    return state.authentication.didAuthenticate ? mainStack() : authStack()
  }

  return onboardingStack()
}

export default RootStack
