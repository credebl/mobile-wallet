import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import SettingsMenu from '../components/buttons/SettingsMenu'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import CredentialDetails from '../screens/CredentialDetails'
import CredentialDetailsW3C from '../screens/CredentialDetailsW3C'
import ListCredentials from '../screens/ListCredentials'
import OpenIDCredentialDetails from '../screens/OpenIDCredentialDetails'
import RenderCertificate from '../screens/RenderCertificate'
import Scan from '../screens/Scan'
import { CredentialStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const CredentialStack: React.FC = () => {
  const Stack = createStackNavigator<CredentialStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const { credentialListHeaderRight: CredentialListHeaderRight } = useConfiguration()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Credentials}
        component={ListCredentials}
        options={() => ({
          title: t('Screens.Credentials'),
          headerRight: () => <CredentialListHeaderRight />,
          headerLeft: () => <SettingsMenu />,
        })}
      />
      <Stack.Screen
        name={Screens.CredentialDetails}
        component={CredentialDetails}
        options={{ title: t('Screens.CredentialDetails') }}
      />
      <Stack.Screen
        name={Screens.CredentialDetailsW3C}
        component={CredentialDetailsW3C}
        options={{ title: t('Screens.CredentialDetails') }}
      />
      <Stack.Screen
        name={Screens.OpenIDCredentialDetails}
        component={OpenIDCredentialDetails}
        options={{ title: t('Screens.CredentialDetails') }}
      />
      <Stack.Screen
        name={Screens.RenderCertificate}
        component={RenderCertificate}
        options={{ title: t('Screens.RenderCertificate') }}
      />
      <Stack.Screen name={Screens.Scan} component={Scan} />
    </Stack.Navigator>
  )
}

export default CredentialStack
