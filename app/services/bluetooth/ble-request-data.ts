import {
  AutoAcceptProof,
  JsonTransformer,
  ProofEventTypes,
  ProofExchangeRecord,
  ProofState,
  ProofStateChangedEvent,
} from '@adeya/ssi'
import {
  DEFAULT_DIDCOMM_INDICATE_CHARACTERISTIC_UUID,
  DEFAULT_DIDCOMM_MESSAGE_CHARACTERISTIC_UUID,
  Peripheral,
} from '@animo-id/react-native-ble-didcomm'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MessageReceiver } from '@credo-ts/core'
// eslint-disable-next-line import/no-extraneous-dependencies
import { BleOutboundTransport } from '@credo-ts/transport-ble'

import { buildProofRequestDataForTemplate, ProofRequestTemplate } from '../../../verifier'
import { AdeyaAgent } from '../../utils/agent'

export type BleRequestProofOptions = {
  agent: AdeyaAgent
  peripheral: Peripheral
  serviceUuid: string
  proofTemplate: ProofRequestTemplate
  onFailure: () => Promise<void> | void
  onConnected?: () => Promise<void> | void
  onDisconnected?: () => Promise<void> | void
}

const startBleTransport = async (agent: AdeyaAgent, peripheral: Peripheral) => {
  const bleOutboundTransport = new BleOutboundTransport(peripheral)
  agent.registerOutboundTransport(bleOutboundTransport)
  await bleOutboundTransport.start(agent)
}

const startPeripheral = async (peripheral: Peripheral, agent: AdeyaAgent, serviceUuid: string) => {
  await peripheral.start()

  await peripheral.setService({
    serviceUUID: serviceUuid,
    messagingUUID: DEFAULT_DIDCOMM_MESSAGE_CHARACTERISTIC_UUID,
    indicationUUID: DEFAULT_DIDCOMM_INDICATE_CHARACTERISTIC_UUID,
  })

  await peripheral.advertise()
  agent.config.logger.info(`[PERIPHERAL]: Advertising on service UUID '${serviceUuid}'`)
}

const createBleProofRequestMessage = async (agent: AdeyaAgent, template: ProofRequestTemplate, serviceUuid: string) => {
  const proofFormats = buildProofRequestDataForTemplate(template)

  const { proofRecord, message } = await agent.proofs.createRequest({
    proofFormats: proofFormats!,
    protocolVersion: 'v2',
    autoAcceptProof: AutoAcceptProof.Never,
  })

  const routing = await agent.mediationRecipient.getRouting({
    useDefaultMediator: false,
  })
  routing.endpoints = [`ble://${serviceUuid}`]
  const { outOfBandInvitation } = await agent.oob.createInvitation({
    routing,
    handshake: false,
    messages: [message],
  })

  return {
    message: JSON.stringify(outOfBandInvitation.toJSON()),
    proofRecordId: proofRecord.id,
  }
}

const sendMessageWhenConnected = async (
  agent: AdeyaAgent,
  proofTemplate: ProofRequestTemplate,
  peripheral: Peripheral,
  serviceUuid: string,
  onConnected?: () => Promise<void> | void,
) =>
  new Promise<string>(resolve => {
    const connectedListener = peripheral.registerOnConnectedListener(async () => {
      if (onConnected) await onConnected()
      const { message, proofRecordId } = await createBleProofRequestMessage(agent, proofTemplate, serviceUuid)
      await peripheral.sendMessage(message)
      connectedListener.remove()
      resolve(proofRecordId)
    })
  })

const disconnectedNotifier = (
  agent: AdeyaAgent,
  peripheral: Peripheral,
  onDisconnected?: () => Promise<void> | void,
) => {
  const disconnectedListener = peripheral.registerOnDisconnectedListener(async ({ identifier }) => {
    agent.config.logger.info(`[PERIPHERAL]: Disconnected from device ${identifier}`)
    if (onDisconnected) await onDisconnected()
    disconnectedListener.remove()
  })
}

// TODO: is this required?
const startMessageReceiver = (agent: AdeyaAgent, peripheral: Peripheral) => {
  const messageReceiver = agent.dependencyManager.resolve(MessageReceiver)
  return peripheral.registerMessageListener(async ({ message }) => {
    agent.config.logger.info(`[PERIPHERAL]: received message ${message.slice(0, 16)}...`)
    await messageReceiver.receiveMessage(JSON.parse(message))
  })
}

const returnWhenProofReceived = (
  id: string,
  agent: AdeyaAgent,
  peripheral: Peripheral,
): Promise<ProofExchangeRecord> => {
  return new Promise((resolve, reject) => {
    const listener = async ({ payload: { proofRecord } }: ProofStateChangedEvent) => {
      const off = () => agent.events.off(ProofEventTypes.ProofStateChanged, listener)
      if (proofRecord.id !== id) return
      if (proofRecord.state === ProofState.PresentationReceived) {
        const proofProtocol = agent.proofs.config.proofProtocols.find(pp => pp.version === 'v2')
        if (!proofProtocol) throw new Error('No V2 proof protocol registered on the agent')
        const { message } = await proofProtocol.acceptPresentation(agent.context, { proofRecord })
        const serializedMessage = JsonTransformer.serialize(message)
        await peripheral.sendMessage(serializedMessage)
      } else if (proofRecord.state === ProofState.Done) {
        off()
        resolve(proofRecord)
      } else if ([ProofState.Abandoned, ProofState.Declined].includes(proofRecord.state)) {
        off()
        reject(new Error(`Proof could not be shared because it has been ${proofRecord.state}`))
      }
    }
    agent.events.on<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged, listener)
  })
}

export const bleRequestUserData = async ({
  peripheral,
  agent,
  serviceUuid,
  proofTemplate,
  onFailure,
  onConnected,
  onDisconnected,
}: BleRequestProofOptions) => {
  try {
    await startBleTransport(agent, peripheral)

    await startPeripheral(peripheral, agent, serviceUuid)

    disconnectedNotifier(agent, peripheral, onDisconnected)

    const proofRecordId = await sendMessageWhenConnected(agent, proofTemplate, peripheral, serviceUuid, onConnected)

    const messageListener = startMessageReceiver(agent, peripheral)
    const resp = await returnWhenProofReceived(proofRecordId, agent, peripheral)

    messageListener.remove()

    return {
      proofRecordId: resp.id,
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
