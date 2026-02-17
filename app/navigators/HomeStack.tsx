import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HistoryMenu from '../components/History/HistoryMenu'
import SettingsMenu from '../components/buttons/SettingsMenu'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import CredentialDetailsW3C from '../screens/CredentialDetailsW3C'
import Home from '../screens/Home'
import ListNotifications from '../screens/ListNotifications'
import OpenIDCredentialDetails from '../screens/OpenIDCredentialDetails'
import { HomeStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const HomeStack: React.FC = () => {
  const Stack = createStackNavigator<HomeStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const { useCustomNotifications } = useConfiguration()
  const { notifications } = useCustomNotifications()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Home}
        component={Home}
        options={() => ({
          title: t('Screens.Home'),
          headerRight: () => <HistoryMenu type={true} notificationCount={notifications.length} />,
          headerLeft: () => <SettingsMenu />,
        })}
      />
      <Stack.Screen
        name={Screens.Notifications}
        component={ListNotifications}
        options={() => ({
          title: t('Screens.Notifications'),
        })}
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
    </Stack.Navigator>
  )
}

export default HomeStack
