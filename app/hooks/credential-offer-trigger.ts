import { DidCommCredentialState, useCredentialByState } from '@credebl/ssi-mobile-didcomm'
import { useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'

import { Screens, Stacks } from '../types/navigators'

export const useCredentialOfferTrigger = (workflowConnectionId?: string): void => {
  const navigation = useNavigation()

  const offers = useCredentialByState(DidCommCredentialState.OfferReceived)

  const goToCredentialOffer = (credentialId?: string) => {
    navigation.getParent()?.navigate(Stacks.NotificationStack, {
      screen: Screens.CredentialOffer,
      params: { credentialId },
    })
  }

  useEffect(() => {
    for (const credential of offers) {
      // eslint-disable-next-line eqeqeq
      if (
        credential.state == DidCommCredentialState.OfferReceived &&
        credential.connectionId === workflowConnectionId
      ) {
        goToCredentialOffer(credential.id)
      }
    }
  }, [offers, workflowConnectionId])
}
