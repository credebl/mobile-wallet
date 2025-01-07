import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderButton, { ButtonLocation } from '../components/buttons/HeaderButton'
import HeaderRightHome from '../components/buttons/HeaderHome'
import { useTheme } from '../contexts/theme'
import Chat from '../screens/Chat'
import Connection from '../screens/Connection'
import ContactDetails from '../screens/ContactDetails'
import CredentialOffer from '../screens/CredentialOffer'
import OpenIDCredentialDetails from '../screens/OpenIDCredentialOffer'
import ProofRequest from '../screens/ProofRequest'
import ProofRequestW3C from '../screens/ProofRequestW3C'
import { DeliveryStackParams, Screens, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { createDefaultStackOptions } from './defaultStackOptions'

const DeliveryStack: React.FC = () => {
  const Stack = createStackNavigator<DeliveryStackParams>()
  const { t } = useTranslation()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator
      initialRouteName={Screens.Connection}
      screenOptions={{
        ...defaultStackOptions,
        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        headerShown: true,
        presentation: 'modal',
        headerLeft: () => null,
        headerRight: () => <HeaderRightHome />,
      }}>
      <Stack.Screen name={Screens.Connection} component={Connection} options={{ ...defaultStackOptions }} />
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
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={{ title: t('Screens.CredentialOffer') }}
      />
      <Stack.Screen
        name={Screens.ContactDetails}
        component={ContactDetails}
        options={{ title: t('Screens.ContactDetails'), headerBackTestID: testIdWithKey('Back') }}
      />
      <Stack.Screen
        name={Screens.OpenIDCredentialDetails}
        component={OpenIDCredentialDetails}
        options={{ title: t('Screens.CredentialOffer') }}
      />
      <Stack.Screen
        name={Screens.Chat}
        component={Chat}
        options={({ navigation }) => ({
          title: t('Screens.CredentialOffer'),
          headerLeft: () => (
            <HeaderButton
              buttonLocation={ButtonLocation.Left}
              accessibilityLabel={t('Global.Back')}
              testID={testIdWithKey('BackButton')}
              onPress={() => {
                navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
              }}
              icon="arrow-left"
            />
          ),
        })}
      />
    </Stack.Navigator>
  )
}

export default DeliveryStack
