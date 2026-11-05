import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { useConfiguration } from '../contexts/configuration'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { ConnectStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

// Hoisted to module scope: creating the navigator inline on every render
// gives it a new component identity each time, which can tear down and
// reset in-flight navigation state in the parent navigator (observed as
// TabStack silently reverting navigation right after it succeeded).
const Stack = createStackNavigator<ConnectStackParams>()

const ConnectStack: React.FC = () => {
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const { scan } = useConfiguration()
  const [store] = useStore()
  return (
    <Stack.Navigator
      // below is part of the temporary gating of the new scan screen tabs feature
      screenOptions={{ ...defaultStackOptions, headerShown: store.preferences.useConnectionInviterCapability }}>
      <Stack.Screen name={Screens.Scan} component={scan} />
    </Stack.Navigator>
  )
}

export default ConnectStack
