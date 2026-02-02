import { CredentialExchangeRecord } from '@adeya/ssi'
import { useMemo } from 'react'

import { useCredentials } from '../contexts/agent'

export const useCredentialsByConnectionId = (connectionId: string): CredentialExchangeRecord[] => {
  const { records: credentials } = useCredentials()
  return useMemo(
    () => credentials.filter((credential: CredentialExchangeRecord) => credential.connectionId === connectionId),
    [credentials, connectionId],
  )
}
