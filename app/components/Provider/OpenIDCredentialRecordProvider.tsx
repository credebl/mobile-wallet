import {
  // addRecord,
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
} from '@credebl/ssi-mobile-openid4vc'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Agent, MdocRecord } from '@credo-ts/core'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { useSdk } from '../../utils/agent'

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
  const [state, setState] = useState<EnhancedOpenIDCredentialRecordState>({
    w3cCredentialRecords: [],
    sdJwtVcRecords: [],
    mdocRecords: [],
    isLoading: true,
  })

  const { sdk } = useSdk()

  useEffect(() => {
    if (!sdk) {
      return
    }
    // agent.w3cCredentials?.getAllCredentialRecords().then(w3cCredentialRecords => {
    //   setState(prev => ({
    //     ...prev,
    //     w3cCredentialRecords: filterW3CCredentialsOnly(w3cCredentialRecords),
    //     isLoading: false,
    //   }))
    // })
    sdk.sdJwtVc.getAll().then(sdJwtVcRecords => {
      setState(prev => ({
        ...prev,
        sdJwtVcRecords: sdJwtVcRecords,
        isLoading: false,
      }))
    })
    sdk.mdoc.getAll().then(mdocRecords => {
      setState(prev => ({
        ...prev,
        mdocRecords: mdocRecords,
        isLoading: false,
      }))
    })
  }, [sdk])

  useEffect(() => {
    if (!state.isLoading && sdk) {
      // const credentialAdded$ = recordsAddedByType(agent, W3cCredentialRecord).subscribe(record => {
      //     setState(addW3cRecord(record, state))
      // })

      // const credentialRemoved$ = recordsRemovedByType(agent, W3cCredentialRecord).subscribe(record => {
      //   setState(removeRecord(record, state))
      // })

      const sdJwtVcAdded$ = recordsAddedByType(sdk, SdJwtVcRecord).subscribe(record => {
        setState(addSdJwtRecord(record, state))
      })

      const sdJwtVcRemoved$ = recordsRemovedByType(sdk, SdJwtVcRecord).subscribe(record => {
        setState(removeSdJwtRecord(record, state))
      })

      const mdocAdded$ = recordsAddedByType(sdk, MdocRecord).subscribe(record => {
        setState(addMdocRecord(record, state))
      })

      const mdocRemoved$ = recordsRemovedByType(sdk, MdocRecord).subscribe(record => {
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
  }, [state, sdk])

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