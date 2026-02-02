import { CredentialState } from '@adeya/ssi'
import { useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'

import { useCredentialByState } from '../contexts/agent'
import { Screens, Stacks } from '../types/navigators'

export const useCredentialOfferTrigger = (workflowConnectionId?: string): void => {
  const navigation = useNavigation()

  const offers = useCredentialByState(CredentialState.OfferReceived)

  const goToCredentialOffer = (credentialId?: string) => {
    navigation.getParent()?.navigate(Stacks.NotificationStack, {
      screen: Screens.CredentialOffer,
      params: { credentialId },
    })
  }

  useEffect(() => {
    for (const credential of offers) {
      // eslint-disable-next-line eqeqeq
      if (credential.state == CredentialState.OfferReceived && credential.connectionId === workflowConnectionId) {
        goToCredentialOffer(credential.id)
      }
    }
  }, [offers, workflowConnectionId])
}
