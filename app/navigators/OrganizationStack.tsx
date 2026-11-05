import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import SettingsMenu from '../components/buttons/SettingsMenu'
import { useTheme } from '../contexts/theme'
import OrganizationDetails from '../screens/OrganizationDetails'
import OrganizationList from '../screens/OrganizationList'
import { OrganizationStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { createDefaultStackOptions } from './defaultStackOptions'

// See ConnectStack.tsx for why this is hoisted out of the component body.
const Stack = createStackNavigator<OrganizationStackParams>()

const OrganizationStack: React.FC = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Explore}
        component={OrganizationList}
        options={() => ({
          title: t('Screens.Explore'),
          headerRight: () => null,
          headerLeft: () => <SettingsMenu />,
        })}
      />
      <Stack.Screen
        name={Screens.OrganizationDetails}
        component={OrganizationDetails}
        options={() => ({
          title: t('Screens.OrganizationDetails'),
          headerRight: () => null,
          headerBackTestID: testIdWithKey('Back'),
        })}
      />
    </Stack.Navigator>
  )
}

export default OrganizationStack
