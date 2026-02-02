import {
  // addRecord,
  defaultState,
  // filterW3CCredentialsOnly,
  // isW3CCredentialRecord,
  // OpenIDCredentialContext,
  OpenIDCredentialRecordState,
  recordsAddedByType,
  recordsRemovedByType,
  removeCredential,
  // removeRecord,
  SdJwtVcRecord,
  storeOpenIdCredential,
  W3cCredentialRecord,
} from '@adeya/ssi'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Agent, MdocRecord } from '@credo-ts/core'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'

import { useAdeyaAgent } from '../../contexts/agent/AgentProvider'

interface EnhancedOpenIDCredentialRecordState extends OpenIDCredentialRecordState {
  mdocRecords: MdocRecord[]
}

interface OpenIDCredentialProviderProps {
  children: React.ReactNode
}

export const addW3cRecord = (
  record: W3cCredentialRecord,
  state: EnhancedOpenIDCredentialRecordState,
): EnhancedOpenIDCredentialRecordState => {
  const newRecordsState = [...state.w3cCredentialRecords]
  newRecordsState.unshift(record)

  return {
    ...state,
    w3cCredentialRecords: newRecordsState,
  }
}

const addSdJwtRecord = (
  record: SdJwtVcRecord,
  state: EnhancedOpenIDCredentialRecordState,
): EnhancedOpenIDCredentialRecordState => {
  const newRecordsState = [...state.sdJwtVcRecords]
  newRecordsState.unshift(record)

  return {
    ...state,
    sdJwtVcRecords: newRecordsState,
  }
}

export const removeSdJwtRecord = (
  record: SdJwtVcRecord,
  state: EnhancedOpenIDCredentialRecordState,
): EnhancedOpenIDCredentialRecordState => {
  const newRecordsState = [...state.sdJwtVcRecords]
  const index = newRecordsState.findIndex(r => r.id === record.id)
  if (index > -1) {
    newRecordsState.splice(index, 1)
  }

  return {
    ...state,
    sdJwtVcRecords: newRecordsState,
  }
}

const addMdocRecord = (
  record: MdocRecord,
  state: EnhancedOpenIDCredentialRecordState,
): EnhancedOpenIDCredentialRecordState => {
  const newRecordsState = [...state.mdocRecords]
  newRecordsState.unshift(record)

  return {
    ...state,
    mdocRecords: newRecordsState,
  }
}

const removeMdocRecord = (
  record: MdocRecord,
  state: EnhancedOpenIDCredentialRecordState,
): EnhancedOpenIDCredentialRecordState => {
  const newRecordsState = [...state.mdocRecords]
  const index = newRecordsState.findIndex(r => r.id === record.id)
  if (index > -1) {
    newRecordsState.splice(index, 1)
  }

  return {
    ...state,
    mdocRecords: newRecordsState,
  }
}

type OpenIDCredentialContext = {
  openIdState: EnhancedOpenIDCredentialRecordState
  storeOpenIdCredential: (agent: Agent, cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord) => Promise<void>
  removeCredential: (agent: Agent, cred: W3cCredentialRecord | SdJwtVcRecord) => Promise<void>
}

const OpenIDCredentialRecordContext = createContext<OpenIDCredentialContext>(null as unknown as OpenIDCredentialContext)

export const OpenIDCredentialRecordProvider: React.FC<PropsWithChildren<OpenIDCredentialProviderProps>> = ({
  children,
}: OpenIDCredentialProviderProps) => {
  const [state, setState] = useState<EnhancedOpenIDCredentialRecordState>({ ...defaultState, mdocRecords: [] })

  const { agent } = useAdeyaAgent()

  useEffect(() => {
    if (!agent) {
      return
    }
    // agent.w3cCredentials?.getAllCredentialRecords().then(w3cCredentialRecords => {
    //   setState(prev => ({
    //     ...prev,
    //     w3cCredentialRecords: filterW3CCredentialsOnly(w3cCredentialRecords),
    //     isLoading: false,
    //   }))
    // })
    agent.sdJwtVc.getAll().then(sdJwtVcRecords => {
      setState(prev => ({
        ...prev,
        sdJwtVcRecords: sdJwtVcRecords,
        isLoading: false,
      }))
    })
    agent.mdoc.getAll().then(mdocRecords => {
      setState(prev => ({
        ...prev,
        mdocRecords: mdocRecords,
        isLoading: false,
      }))
    })
  }, [agent])

  useEffect(() => {
    if (!state.isLoading && agent) {
      // const credentialAdded$ = recordsAddedByType(agent, W3cCredentialRecord).subscribe(record => {
      //     setState(addW3cRecord(record, state))
      // })

      // const credentialRemoved$ = recordsRemovedByType(agent, W3cCredentialRecord).subscribe(record => {
      //   setState(removeRecord(record, state))
      // })

      const sdJwtVcAdded$ = recordsAddedByType(agent, SdJwtVcRecord).subscribe(record => {
        setState(addSdJwtRecord(record, state))
      })

      const sdJwtVcRemoved$ = recordsRemovedByType(agent, SdJwtVcRecord).subscribe(record => {
        setState(removeSdJwtRecord(record, state))
      })

      const mdocAdded$ = recordsAddedByType(agent, MdocRecord).subscribe(record => {
        setState(addMdocRecord(record, state))
      })

      const mdocRemoved$ = recordsRemovedByType(agent, MdocRecord).subscribe(record => {
        setState(removeMdocRecord(record, state))
      })

      return () => {
        // credentialAdded$.unsubscribe()
        // credentialRemoved$.unsubscribe()
        sdJwtVcAdded$.unsubscribe()
        sdJwtVcRemoved$.unsubscribe()
        mdocAdded$.unsubscribe()
        mdocRemoved$.unsubscribe()
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
