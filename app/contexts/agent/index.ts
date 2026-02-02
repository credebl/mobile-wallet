import AgentProvider, { useAdeyaAgent } from './AgentProvider'
import { useBasicMessages, useBasicMessagesByConnectionId } from './BasicMessageProvider'
import { useConnections, useConnectionById } from './ConnectionProvider'
import {
  useCredentials,
  useCredentialById,
  useCredentialByState,
  useCredentialNotInState,
  useCredentialsByConnectionId,
} from './CredentialProvider'
import { useExchanges, useExchangesByConnectionId } from './ExchangesProvider'
import { useProofs, useProofById, useProofByState, useProofNotInState, useProofsByConnectionId } from './ProofProvider'

export {
  useAdeyaAgent,
  useBasicMessages,
  useBasicMessagesByConnectionId,
  useConnections,
  useConnectionById,
  useCredentials,
  useCredentialById,
  useCredentialByState,
  useCredentialNotInState,
  useCredentialsByConnectionId,
  useProofs,
  useProofById,
  useProofByState,
  useProofNotInState,
  useExchanges,
  useExchangesByConnectionId,
  useProofsByConnectionId,
}

export default AgentProvider
