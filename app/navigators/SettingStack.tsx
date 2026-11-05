import { createStackNavigator } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter } from 'react-native'

import { EventTypes } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import CreateWallet from '../screens/CreateWallet'
import DataRetention from '../screens/DataRetention'
import ExportWallet from '../screens/ExportWallet'
import ExportWalletConfirmation from '../screens/ExportWalletConfirmation'
import GoogleDriveSignIn from '../screens/GoogleDriveSignIn'
import ImportSuccess from '../screens/ImportSuccess'
import ImportWalletVerify from '../screens/ImportWalletConfirmation'
import Language from '../screens/Language'
import NameWallet from '../screens/NameWallet'
import Onboarding from '../screens/Onboarding'
import { createCarouselStyle } from '../screens/OnboardingPages'
import PINCreate from '../screens/PINCreate'
import PINRecreate from '../screens/PINRecreate'
import Settings from '../screens/Settings'
import Success from '../screens/Success'
import Tours from '../screens/Tours'
import UseBiometry from '../screens/UseBiometry'
import { Screens, SettingStackParams } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { createDefaultStackOptions } from './defaultStackOptions'

// See ConnectStack.tsx for why this is hoisted out of the component body.
const Stack = createStackNavigator<SettingStackParams>()

const SettingStack: React.FC = () => {
  const theme = useTheme()
  const [biometryUpdatePending, setBiometryUpdatePending] = useState<boolean>(false)
  const { t } = useTranslation()
  const { pages, terms, developer } = useConfiguration()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const OnboardingTheme = theme.OnboardingTheme
  const carousel = createCarouselStyle(OnboardingTheme)

  useEffect(() => {
    const handleBiometry = DeviceEventEmitter.addListener(EventTypes.BIOMETRY_UPDATE, (value: boolean) => {
      setBiometryUpdatePending(value)
    })

    return () => {
      handleBiometry.remove()
    }
  }, [])

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Settings}
        component={Settings}
        options={{ title: t('Screens.Settings'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.Language}
        component={Language}
        options={{ title: t('Screens.Language'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.DataRetention}
        component={DataRetention}
        options={{ title: t('Screens.DataRetention'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.Tours}
        component={Tours}
        options={{ title: t('Screens.Tours'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.UseBiometry}
        component={UseBiometry}
        options={{
          title: t('Screens.Biometry'),
          headerLeft: biometryUpdatePending ? () => null : undefined,
          headerBackTestID: testIdWithKey('Back'),
        }}
      />
      <Stack.Screen
        name={Screens.RecreatePIN}
        component={PINRecreate}
        options={{ title: t('Screens.ChangePIN'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.CreatePIN}
        component={PINCreate}
        options={{ title: t('Screens.ChangePIN'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.Terms}
        component={terms}
        options={{ title: t('Screens.Terms'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.Developer}
        component={developer}
        options={{ title: t('Screens.Developer'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.NameWallet}
        component={NameWallet}
        options={{ title: t('Screens.NameWallet'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.ExportWallet}
        component={ExportWallet}
        options={{ title: t('Screens.BackupWallet'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.ExportWalletConfirmation}
        component={ExportWalletConfirmation}
        options={{ title: t('Screens.Confirmation') }}
      />
      <Stack.Screen name={Screens.Success} component={Success} options={{ title: t('Screens.BackupWallet') }} />
      <Stack.Screen name={Screens.Onboarding} options={{ title: t('Screens.Onboarding') }}>
        {props => (
          <Onboarding
            {...props}
            nextButtonText={t('Global.Next')}
            previousButtonText={t('Global.Back')}
            pages={pages(() => null, OnboardingTheme)}
            style={carousel}
            disableSkip={true}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name={Screens.ImportWalletVerify}
        component={ImportWalletVerify}
        options={{ title: t('Screens.VerifyPhrase'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen name={Screens.ImportSuccess} component={ImportSuccess} options={{ title: t('Screens.Success') }} />
      <Stack.Screen
        name={Screens.WalletOptions}
        component={CreateWallet}
        options={{ title: t('Screens.CreateWallet') }}
      />
      <Stack.Screen
        name={Screens.GoogleDriveSignIn}
        component={GoogleDriveSignIn}
        options={{ title: t('Screens.GoogleDriveSignIn') }}
      />
    </Stack.Navigator>
  )
}

export default SettingStack
