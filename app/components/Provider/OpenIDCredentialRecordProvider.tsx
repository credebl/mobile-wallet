import {
  addRecord,
  defaultState,
  filterW3CCredentialsOnly,
  isW3CCredentialRecord,
  OpenIDCredentialContext,
  OpenIDCredentialRecordState,
  recordsAddedByType,
  recordsRemovedByType,
  removeCredential,
  removeRecord,
  storeOpenIdCredential,
  useAdeyaAgent,
  W3cCredentialRecord,
} from '@adeya/ssi'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'

interface OpenIDCredentialProviderProps {
  children: React.ReactNode
}

const OpenIDCredentialRecordContext = createContext<OpenIDCredentialContext>(null as unknown as OpenIDCredentialContext)

export const OpenIDCredentialRecordProvider: React.FC<PropsWithChildren<OpenIDCredentialProviderProps>> = ({
  children,
}: OpenIDCredentialProviderProps) => {
  const [state, setState] = useState<OpenIDCredentialRecordState>(defaultState)

  const { agent } = useAdeyaAgent()

  useEffect(() => {
    if (!agent) {
      return
    }
    agent.w3cCredentials?.getAllCredentialRecords().then(w3cCredentialRecords => {
      setState(prev => ({
        ...prev,
        w3cCredentialRecords: filterW3CCredentialsOnly(w3cCredentialRecords),
        isLoading: false,
      }))
    })
  }, [agent])

  useEffect(() => {
    if (!state.isLoading && agent) {
      const credentialAdded$ = recordsAddedByType(agent, W3cCredentialRecord).subscribe(record => {
        //This handler will return ANY creds added to the wallet even DidComm
        //Sounds like a bug in the hooks package
        //This check will safe guard the flow untill a fix goes to the hooks
        if (isW3CCredentialRecord(record)) {
          setState(addRecord(record, state))
        }
      })

      const credentialRemoved$ = recordsRemovedByType(agent, W3cCredentialRecord).subscribe(record => {
        setState(removeRecord(record, state))
      })

      return () => {
        credentialAdded$.unsubscribe()
        credentialRemoved$.unsubscribe()
      }
    }
  }, [state, agent])

  return (
    <OpenIDCredentialRecordContext.Provider
      value={{
        openIdState: state,
        storeOpenIdCredential: storeOpenIdCredential,
        removeCredential: removeCredential,
      }}>
      {children}
    </OpenIDCredentialRecordContext.Provider>
  )
}

export const useOpenIDCredentials = () => useContext(OpenIDCredentialRecordContext)
