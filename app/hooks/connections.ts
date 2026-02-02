import { ConnectionRecord, OutOfBandRecord, findOutOfBandRecordById } from '@adeya/ssi'
import { useMemo, useState } from 'react'

import { useConnectionById, useConnections } from '../contexts/agent'
import { AdeyaAgent } from '../utils/agent'

export const useConnectionByOutOfBandId = (outOfBandId: string): ConnectionRecord | undefined => {
  const { records: connections } = useConnections()
  return useMemo(
    () => connections.find((connection: ConnectionRecord) => connection.outOfBandId === outOfBandId),
    [connections, outOfBandId],
  )
}

export const useOutOfBandById = (agent: AdeyaAgent, oobId: string): OutOfBandRecord | undefined => {
  const [oob, setOob] = useState<OutOfBandRecord | undefined>(undefined)
  if (!oob) {
    findOutOfBandRecordById(agent, oobId).then(res => {
      if (res) {
        setOob(res)
      }
    })
  }
  return oob
}

export const useOutOfBandByConnectionId = (agent: AdeyaAgent, connectionId: string): OutOfBandRecord | undefined => {
  const connection = useConnectionById(connectionId)
  return useOutOfBandById(agent, connection?.outOfBandId ?? '')
}
