import { MobileSDK, MobileSDKOptions, useMobileSDK } from '@credebl/ssi-mobile-core'
import { ConsoleLogger, DidCommMediatorPickupStrategy, DidCommSDK, LogLevel } from '@credebl/ssi-mobile-didcomm'
import { OpenID4VCSDK } from '@credebl/ssi-mobile-openid4vc'

import ledgers from '../../configs/ledgers/indy'

export type Modules = {
  openid: OpenID4VCSDK
  didcomm: DidCommSDK
}

export type AdeyaSdk = MobileSDK<Modules>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getTrustedCerts(): Promise<string[]> {
  // Uncomment and update URL when ready to fetch from remote source
  // const response = await fetch(
  //   'https://raw.githubusercontent.com/RinkalBhojani/x509-test-certs/refs/heads/main/trusted-certs.json'
  // );
  // if (!response.ok) {
  //   throw new Error(`HTTP error! status: ${response.status}`);
  // }
  // const data = await response.json();
  // console.log('Trusted certificates fetched successfully:', data);
  // return data;

  // Return empty array as fallback
  const certs: string[] = []
  return certs
}

export const createConfig = (walletId: string, walletKey: string): MobileSDKOptions<Modules> => ({
  agentConfig: {
    allowInsecureHttpUrls: true,
    logger: new ConsoleLogger(LogLevel.debug),
  },
  askarConfig: {
    id: walletId,
    key: walletKey,
  },
  modules: {
    didcomm: new DidCommSDK({
      peerNumAlgoForDidExchangeRequests: 1,
      peerNumAlgoForDidRotation: 4,
      processDidCommMessagesConcurrently: true,
      mediatorPickupStrategy: DidCommMediatorPickupStrategy.PickUpV2LiveMode,
      indyVdr: {
        networks: ledgers,
      },
    }),
    openid: new OpenID4VCSDK({
      trustedCertificates: [],
    }),
  },
})

export const useSdk = () => {
  const { sdk } = useMobileSDK<Modules>()
  return { sdk }
}

export const isMediationConfigured = async (sdk: AdeyaSdk): Promise<boolean> => {
  const mediationRecord = await sdk.modules.didcomm.agent.didcomm.mediationRecipient.findDefaultMediator()
  return mediationRecord !== null
}
