import {
  useConnectionById,
  useConnections,
  DidCommOutOfBandRecord,
  DidCommConnectionRecord,
} from '@credebl/ssi-mobile-didcomm'
import { useMemo, useState } from 'react'

import { AdeyaSdk } from '../utils/agent'

export const useConnectionByOutOfBandId = (outOfBandId: string): DidCommConnectionRecord | undefined => {
  const { records: connections } = useConnections()
  return useMemo(
    () => connections.find((connection: DidCommConnectionRecord) => connection.outOfBandId === outOfBandId),
    [connections, outOfBandId],
  )
}

export const useOutOfBandById = (sdk: AdeyaSdk, oobId: string): DidCommOutOfBandRecord | undefined => {
  const [oob, setOob] = useState<DidCommOutOfBandRecord | undefined>(undefined)
  if (!oob) {
    sdk.modules.didcomm.connections.findOutOfBandRecordById(oobId).then(res => {
      if (res) {
        setOob(res)
      }
    })
  }
  return oob
}

export const useOutOfBandByConnectionId = (sdk: AdeyaSdk, connectionId: string): DidCommOutOfBandRecord | undefined => {
  const connection = useConnectionById(connectionId)
  return useOutOfBandById(sdk, connection?.outOfBandId ?? '')
}
