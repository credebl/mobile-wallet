import { DidCommProofExchangeRecord, useProofs } from '@credebl/ssi-mobile-didcomm'
import { useMemo } from 'react'

import { ProofMetadata, ProofCustomMetadata } from '../types/metadata'

export const useProofsByTemplateId = (templateId: string): DidCommProofExchangeRecord[] => {
  const { records: proofs } = useProofs()

  return useMemo(
    () =>
      proofs.filter((proof: DidCommProofExchangeRecord) => {
        const metadata = proof?.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
        if (metadata?.proof_request_template_id === templateId) {
          return proof
        }
      }),
    [proofs, templateId],
  )
}
