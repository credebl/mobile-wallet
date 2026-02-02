import type { Agent } from '@credo-ts/core'
import type { PropsWithChildren } from 'react'

import * as React from 'react'
import { createContext, useState, useContext } from 'react'

// eslint-disable-next-line import/no-cycle
import { AdeyaAgent } from '../../utils/agent'

import BasicMessageProvider from './BasicMessageProvider'
import ConnectionProvider from './ConnectionProvider'
import CredentialProvider from './CredentialProvider'
import ProofProvider from './ProofProvider'

interface AgentContextInterface<AppAgent extends Agent = Agent> {
  loading: boolean
  agent: AppAgent | undefined
  setAgent: (agent: Agent) => void
}

const AgentContext = createContext<AgentContextInterface | undefined>(undefined)

export const useAdeyaAgent = <AppAgent extends Agent>() => {
  const agentContext = useContext(AgentContext)
  if (!agentContext) {
    throw new Error('useAgent must be used within a AgentContextProvider')
  }
  return agentContext as AgentContextInterface<AppAgent>
}

interface Props {
  agent?: AdeyaAgent
}

const AgentProvider: React.FC<PropsWithChildren<Props>> = ({ children }) => {
  const [agentState, setAgentState] = useState({
    loading: true,
    agent: undefined,
  })

  const setAgent = (agent: AdeyaAgent) => {
    setAgentState({ agent, loading: false })
  }

  return (
    <AgentContext.Provider value={{ setAgent, ...agentState }}>
      <ConnectionProvider agent={agentState.agent}>
        <CredentialProvider agent={agentState.agent}>
          <ProofProvider agent={agentState.agent}>
            <BasicMessageProvider agent={agentState.agent}>{children}</BasicMessageProvider>
          </ProofProvider>
        </CredentialProvider>
      </ConnectionProvider>
    </AgentContext.Provider>
  )
}

export default AgentProvider
