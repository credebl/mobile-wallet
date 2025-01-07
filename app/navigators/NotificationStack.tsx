import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import OpenIDProofPresentation from '../components/OpenId/OpenIDProofPresentation'
import HeaderButton, { ButtonLocation } from '../components/buttons/HeaderButton'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import CredentialDetails from '../screens/CredentialDetails'
import CredentialOffer from '../screens/CredentialOffer'
import OpenIdCredentialOffer from '../screens/OpenIDCredentialOffer'
import ProofRequest from '../screens/ProofRequest'
import ProofRequestW3C from '../screens/ProofRequestW3C'
import { NotificationStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { createDefaultStackOptions } from './defaultStackOptions'

const NotificationStack: React.FC = () => {
  const Stack = createStackNavigator<NotificationStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const { customNotification } = useConfiguration()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.CredentialDetails}
        component={CredentialDetails}
        options={{ title: t('Screens.CredentialDetails') }}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={{ title: t('Screens.CredentialOffer') }}
      />
      <Stack.Screen
        name={Screens.OpenIdCredentialOffer}
        component={OpenIdCredentialOffer}
        options={{ title: t('Screens.CredentialOffer') }}
      />

      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={{ title: t('Screens.ProofRequest') }}
      />
      <Stack.Screen
        name={Screens.ProofRequestW3C}
        component={ProofRequestW3C}
        options={{ title: t('Screens.ProofRequest') }}
      />
      <Stack.Screen
        name={Screens.CustomNotification}
        component={customNotification.component}
        options={{ title: t(customNotification.pageTitle as any) }}
      />
      <Stack.Screen
        name={Screens.OpenIDProofPresentation}
        component={OpenIDProofPresentation}
        options={({ navigation }) => ({
          title: t('Screens.ProofRequest'),
          headerLeft: () => (
            <HeaderButton
              buttonLocation={ButtonLocation.Left}
              accessibilityLabel={t('Global.Back')}
              testID={testIdWithKey('BackButton')}
              onPress={() => navigation.navigate(Screens.Home)}
              icon="arrow-left"
            />
          ),
        })}
      />
    </Stack.Navigator>
  )
}

export default NotificationStack
