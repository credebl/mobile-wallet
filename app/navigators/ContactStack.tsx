import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderRightHome from '../components/buttons/HeaderHome'
import SettingsMenu from '../components/buttons/SettingsMenu'
import { useTheme } from '../contexts/theme'
import Chat from '../screens/Chat'
import ConnectionInvitation from '../screens/ConnectionInvitation'
import ContactDetails from '../screens/ContactDetails'
import CredentialDetails from '../screens/CredentialDetails'
import CredentialDetailsW3C from '../screens/CredentialDetailsW3C'
import CredentialOffer from '../screens/CredentialOffer'
import Home from '../screens/Home'
import ListContacts from '../screens/ListContacts'
import ProofDetails from '../screens/ProofDetails'
import ProofRequest from '../screens/ProofRequest'
import ProofRequestW3C from '../screens/ProofRequestW3C'
import WhatAreContacts from '../screens/WhatAreContacts'
import { ContactStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { createDefaultStackOptions } from './defaultStackOptions'

// See ConnectStack.tsx for why this is hoisted out of the component body.
const Stack = createStackNavigator<ContactStackParams>()

const ContactStack: React.FC = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.Contacts} component={ListContacts} options={{ title: t('Screens.Contacts') }} />
      <Stack.Screen
        name={Screens.ContactDetails}
        component={ContactDetails}
        options={{
          title: t('Screens.ContactDetails'),
          headerBackTestID: testIdWithKey('Back'),
        }}
      />
      <Stack.Screen
        name={Screens.Home}
        component={Home}
        options={() => ({
          title: t('Screens.Home'),
          headerRight: () => null,
          headerLeft: () => <SettingsMenu />,
        })}
      />
      <Stack.Screen name={Screens.Chat} component={Chat} />
      <Stack.Screen
        name={Screens.WhatAreContacts}
        component={WhatAreContacts}
        options={{ title: t('Screens.ContactDetails') }}
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
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={{ title: t('Screens.CredentialOffer') }}
      />
      <Stack.Screen
        name={Screens.ProofDetails}
        component={ProofDetails}
        options={() => ({
          title: '',
          headerRight: () => <HeaderRightHome />,
        })}
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
        name={Screens.ConnectionInvitation}
        component={ConnectionInvitation}
        options={() => ({
          title: '',
          headerRight: () => <HeaderRightHome />,
        })}
      />
    </Stack.Navigator>
  )
}

export default ContactStack
