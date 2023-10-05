import { useAdeyaAgent, useConnectionById, useConnections } from '@adeya/ssi'
import { ConnectionRecord, OutOfBandRecord } from '@aries-framework/core'
import { useMemo, useState } from 'react'

export const useConnectionByOutOfBandId = (outOfBandId: string): ConnectionRecord | undefined => {
  const { records: connections } = useConnections()
  return useMemo(
    () => connections.find((connection: ConnectionRecord) => connection.outOfBandId === outOfBandId),
    [connections, outOfBandId],
  )
}

export const useOutOfBandById = (oobId: string): OutOfBandRecord | undefined => {
  const { agent } = useAdeyaAgent()
  const [oob, setOob] = useState<OutOfBandRecord | undefined>(undefined)
  if (!oob) {
    agent?.oob.findById(oobId).then(res => {
      if (res) {
        setOob(res)
      }
    })
  }
  return oob
}

export const useOutOfBandByConnectionId = (connectionId: string): OutOfBandRecord | undefined => {
  const connection = useConnectionById(connectionId)
  return useOutOfBandById(connection?.outOfBandId ?? '')
}
