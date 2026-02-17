import {
  DidCommCredentialExchangeRecord,
  DidCommCredentialState,
  DidCommProofExchangeRecord,
  DidCommProofState,
  useCredentialByState,
  useProofByState,
} from '@credebl/ssi-mobile-didcomm'

import { ProofCustomMetadata, ProofMetadata } from '../../verifier'
import { CredentialMetadata, customMetadata } from '../types/metadata'

interface Notifications {
  total: number
  notifications: Array<DidCommCredentialExchangeRecord | DidCommProofExchangeRecord>
}

export const useNotifications = (): Notifications => {
  const offers = useCredentialByState(DidCommCredentialState.OfferReceived)
  const proofsRequested = useProofByState(DidCommProofState.RequestReceived)
  const proofsDone = useProofByState([DidCommProofState.Done, DidCommProofState.PresentationReceived]).filter(
    (proof: DidCommProofExchangeRecord) => {
      if (proof.isVerified === undefined) return false
      const metadata = proof.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
      return !metadata?.details_seen
    },
  )
  const revoked = useCredentialByState(DidCommCredentialState.Done).filter((cred: DidCommCredentialExchangeRecord) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const metadata = cred!.metadata.get(CredentialMetadata.customMetadata) as customMetadata
    if (cred?.revocationNotification && metadata?.revoked_seen == undefined) {
      return cred
    }
  })

  const notifications = [...offers, ...proofsRequested, ...proofsDone, ...revoked].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return { total: notifications.length, notifications }
}
