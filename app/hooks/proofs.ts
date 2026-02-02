import { ProofExchangeRecord } from '@adeya/ssi'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useProofs, useCredentials, useProofById } from '../contexts/agent'
import { useAppAgent } from '../utils/agent'
import { retrieveCredentialsForProof } from '../utils/helpers'

export const useProofsByConnectionId = (connectionId: string): ProofExchangeRecord[] => {
  const { records: proofs } = useProofs()
  return useMemo(
    () => proofs.filter((proof: ProofExchangeRecord) => proof.connectionId === connectionId),
    [proofs, connectionId],
  )
}

export const useAllCredentialsForProof = (proofId: string) => {
  const { t } = useTranslation()
  const { agent } = useAppAgent()
  const fullCredentials = useCredentials().records
  const proof = useProofById(proofId)
  return useMemo(() => {
    if (!proof || !agent) {
      return
    }
    return retrieveCredentialsForProof(agent, proof, fullCredentials, t)
  }, [proofId])
}
