import { useProofs, useCredentials, useProofById, DidCommProofExchangeRecord } from '@credebl/ssi-mobile-didcomm'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useSdk } from '../utils/agent'
import { retrieveCredentialsForProof } from '../utils/helpers'

export const useProofsByConnectionId = (connectionId: string): DidCommProofExchangeRecord[] => {
  const { records: proofs } = useProofs()
  return useMemo(
    () => proofs.filter((proof: DidCommProofExchangeRecord) => proof.connectionId === connectionId),
    [proofs, connectionId],
  )
}

export const useAllCredentialsForProof = (proofId: string) => {
  const { t } = useTranslation()
  const { sdk } = useSdk()
  const fullCredentials = useCredentials().records
  const proof = useProofById(proofId)
  return useMemo(() => {
    if (!proof || !sdk) {
      return
    }
    return retrieveCredentialsForProof(sdk, proof, fullCredentials, t)
  }, [proofId])
}
