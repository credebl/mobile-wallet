import { JsonTransformer, ProofEventTypes, ProofExchangeRecord, ProofState, ProofStateChangedEvent } from '@adeya/ssi'
import {
  Central,
  DEFAULT_DIDCOMM_INDICATE_CHARACTERISTIC_UUID,
  DEFAULT_DIDCOMM_MESSAGE_CHARACTERISTIC_UUID,
} from '@animo-id/react-native-ble-didcomm'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OutOfBandInvitation } from '@credo-ts/core'
// eslint-disable-next-line import/no-extraneous-dependencies
import { BleInboundTransport, BleOutboundTransport } from '@credo-ts/transport-ble'

import { AdeyaAgent } from '../../utils/agent'

export type BleShareProofOptions = {
  agent: AdeyaAgent
  central: Central
  serviceUuid: string
  onFailure: () => Promise<void> | void
  onConnected?: () => Promise<void> | void
  onDisconnected?: () => Promise<void> | void
}

const startBleTransport = async (agent: AdeyaAgent, central: Central) => {
  const bleInboundTransport = new BleInboundTransport(central)
  agent.registerInboundTransport(bleInboundTransport)
  await bleInboundTransport.start(agent)
  const bleOutboundTransport = new BleOutboundTransport(central)
  agent.registerOutboundTransport(bleOutboundTransport)
  await bleOutboundTransport.start(agent)
}

const startCentral = async (central: Central, agent: AdeyaAgent, serviceUuid: string) => {
  await central.start()
  await central.setService({
    serviceUUID: serviceUuid,
    messagingUUID: DEFAULT_DIDCOMM_MESSAGE_CHARACTERISTIC_UUID,
    indicationUUID: DEFAULT_DIDCOMM_INDICATE_CHARACTERISTIC_UUID,
  })
  await central.scan()
  agent.config.logger.info(`[CENTRAL]: Scanning on service UUID '${serviceUuid}'`)
}

const discoverAndConnect = async (agent: AdeyaAgent, central: Central) =>
  await new Promise<void>(resolve => {
    const listener = central.registerOnDiscoveredListener(({ identifier, name }) => {
      agent.config.logger.info(`[CENTRAL]: Discovered device ${name ? `(${name})` : ''}: ${identifier}`)

      central.connect(identifier).then(() => {
        listener.remove()
        resolve()
      })
    })
  })

const connectedNotifier = async (agent: AdeyaAgent, central: Central, onConnected?: () => Promise<void> | void) =>
  new Promise<void>(resolve => {
    const connectedListener = central.registerOnConnectedListener(async ({ identifier, name }) => {
      agent.config.logger.info(`[CENTRAL]: Connected to device ${name ? `(${name})` : ''}: ${identifier}`)
      if (onConnected) await onConnected()
      connectedListener.remove()
      resolve()
    })
  })

const disconnectedNotifier = (agent: AdeyaAgent, central: Central, onDisconnected?: () => Promise<void> | void) => {
  const disconnectedListener = central.registerOnDisconnectedListener(async ({ identifier }) => {
    agent.config.logger.info(`[CENTRAL]: Disconnected from device ${identifier}`)
    if (onDisconnected) await onDisconnected()
    disconnectedListener.remove()
  })
}

const autoRespondToBleProofRequest = (agent: AdeyaAgent): Promise<ProofExchangeRecord> => {
  return new Promise(resolve => {
    const listener = async ({ payload: { proofRecord } }: ProofStateChangedEvent) => {
      const off = () => agent.events.off(ProofEventTypes.ProofStateChanged, listener)
      if (proofRecord.state === ProofState.RequestReceived) {
        resolve(proofRecord)
        off()
      }
    }
    agent.events.on<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged, listener)
  })
}

const shareProof = async (agent: AdeyaAgent, central: Central, serviceUuid: string) =>
  new Promise<ProofExchangeRecord>(resolve => {
    const receivedMessageListener = central.registerMessageListener(async ({ message }) => {
      agent.config.logger.info(`[CENTRAL]: received message ${message.slice(0, 16)}...`)

      const parsedMessage = JsonTransformer.deserialize(message, OutOfBandInvitation)

      const routing = await agent.mediationRecipient.getRouting({
        useDefaultMediator: false,
      })

      await agent.oob.receiveInvitation(parsedMessage, {
        routing: { ...routing, endpoints: [`ble://${serviceUuid}`] },
      })

      const proofExchangeRecord = await autoRespondToBleProofRequest(agent)

      receivedMessageListener.remove()
      resolve(proofExchangeRecord)
    })
  })

export const bleShareData = async ({
  agent,
  central,
  serviceUuid,
  onFailure,
  onConnected,
  onDisconnected,
}: BleShareProofOptions) => {
  try {
    await startBleTransport(agent, central)

    await startCentral(central, agent, serviceUuid)

    disconnectedNotifier(agent, central, onDisconnected)

    await discoverAndConnect(agent, central)

    await connectedNotifier(agent, central, onConnected)

    const proofRecord = await shareProof(agent, central, serviceUuid)
    return {
      proofRecordId: proofRecord.id,
    }
  } catch (e) {
    if (e instanceof Error) {
      agent.config.logger.error(e.message, { cause: e })
    } else {
      agent.config.logger.error(e as string)
    }

    onFailure()
    throw e
  }
}
