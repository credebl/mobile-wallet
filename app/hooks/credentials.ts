import { DidCommCredentialExchangeRecord, useCredentials } from '@credebl/ssi-mobile-didcomm'
import { useMemo } from 'react'

export const useCredentialsByConnectionId = (connectionId: string): DidCommCredentialExchangeRecord[] => {
  const { records: credentials } = useCredentials()
  return useMemo(
    () => credentials.filter((credential: DidCommCredentialExchangeRecord) => credential.connectionId === connectionId),
    [credentials, connectionId],
  )
}
