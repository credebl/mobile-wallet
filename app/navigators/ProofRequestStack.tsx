import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderButton, { ButtonLocation } from '../components/buttons/HeaderButton'
import HeaderRightHome from '../components/buttons/HeaderHome'
import { useTheme } from '../contexts/theme'
import ListProofRequests from '../screens/ListProofRequests'
import OpenID4VCProofChangeCredential from '../screens/OpenID4VCProofChangeCredential'
import ProofChangeCredential from '../screens/ProofChangeCredential'
import ProofChangeCredentialW3C from '../screens/ProofChangeCredentialW3C'
import ProofDetails from '../screens/ProofDetails'
import ProofRequestDetails from '../screens/ProofRequestDetails'
import ProofRequestUsageHistory from '../screens/ProofRequestUsageHistory'
import ProofRequesting from '../screens/ProofRequesting'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { createDefaultStackOptions } from './defaultStackOptions'

const ProofRequestStack: React.FC = () => {
  const Stack = createStackNavigator<ProofRequestsStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.ProofRequests}
        component={ListProofRequests}
        options={{ title: t('Screens.ChooseProofRequest') }}
      />
      <Stack.Screen
        name={Screens.ProofRequestDetails}
        component={ProofRequestDetails}
        options={() => ({
          title: '',
        })}
      />
      <Stack.Screen
        name={Screens.ProofChangeCredential}
        component={ProofChangeCredential}
        options={{ title: t('Screens.ProofChangeCredential') }}
      />
      <Stack.Screen
        name={Screens.ProofChangeCredentialW3C}
        component={ProofChangeCredentialW3C}
        options={{ title: t('Screens.ProofChangeCredentialW3C') }}
      />
      <Stack.Screen
        name={Screens.ProofChangeCredentialOpenId4VP}
        component={OpenID4VCProofChangeCredential}
        options={{ title: t('Screens.ProofChangeCredentialW3C') }}
      />
      <Stack.Screen
        name={Screens.ProofRequesting}
        component={ProofRequesting}
        options={({ navigation }) => ({
          title: '',
          headerLeft: () => (
            <HeaderButton
              buttonLocation={ButtonLocation.Left}
              accessibilityLabel={t('Global.Back')}
              testID={testIdWithKey('BackButton')}
              onPress={() => navigation.navigate(Screens.ProofRequests, {})}
              icon="arrow-left"
            />
          ),
        })}
      />
      <Stack.Screen
        name={Screens.ProofDetails}
        component={ProofDetails}
        options={({ navigation, route }) => ({
          title: '',
          headerLeft: () => (
            <HeaderButton
              buttonLocation={ButtonLocation.Left}
              accessibilityLabel={t('Global.Back')}
              testID={testIdWithKey('BackButton')}
              onPress={() => {
                if (route.params.isHistory) {
                  navigation.goBack()
                } else {
                  navigation.navigate(Screens.ProofRequests, {})
                }
              }}
              icon="arrow-left"
            />
          ),
          headerRight: () => <HeaderRightHome />,
        })}
      />
      <Stack.Screen
        name={Screens.ProofRequestUsageHistory}
        component={ProofRequestUsageHistory}
        options={() => ({
          title: t('Screens.ProofRequestUsageHistory'),
          headerRight: () => <HeaderRightHome />,
        })}
      />
    </Stack.Navigator>
  )
}

export default ProofRequestStack
