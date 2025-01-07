import {
  Agent,
  CacheModule,
  DidsModule,
  IndyVdrIndyDidResolver,
  JwkDidRegistrar,
  JwkDidResolver,
  MediatorPickupStrategy,
  OpenId4VcHolderModule,
  SingleContextStorageLruCache,
  WebDidResolver,
  getAgentModules,
  useAdeyaAgent,
} from '@adeya/ssi'
import { PolygonDidResolver, PolygonModule } from '@ayanworks/credo-polygon-w3c-module'
// eslint-disable-next-line import/no-extraneous-dependencies
import { KeyDidRegistrar, KeyDidResolver } from '@credo-ts/core'
import { Config } from 'react-native-config'

import indyLedgers from '../../configs/ledgers/indy'
export const adeyaAgentModules = () => {
  return {
    ...getAgentModules({
      mediatorInvitationUrl: Config.MEDIATOR_URL!,
      mediatorPickupStrategy: MediatorPickupStrategy.PickUpV2LiveMode,
      indyNetworks: indyLedgers,
    }),
    polygon: new PolygonModule({}),
    dids: new DidsModule({
      resolvers: [
        new WebDidResolver(),
        new KeyDidResolver(),
        new PolygonDidResolver(),
        new IndyVdrIndyDidResolver(),
        new JwkDidResolver(),
      ],
      registrars: [new KeyDidRegistrar(), new JwkDidRegistrar()],
    }),
    cache: new CacheModule({
      cache: new SingleContextStorageLruCache({
        limit: 50,
      }),
    }),
    openId4VcHolder: new OpenId4VcHolderModule(),
  }
}
export type AdeyaAgent = Agent<ReturnType<typeof adeyaAgentModules>>
export type AdeyaAgentModules = ReturnType<typeof adeyaAgentModules>

interface MyAgentContextInterface {
  loading: boolean
  agent: AdeyaAgent
  setAgent: (agent: AdeyaAgent) => void
}

export const useAppAgent = useAdeyaAgent as () => MyAgentContextInterface
