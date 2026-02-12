import { MobileSDKOptions, useMobileSDK } from '@credebl/ssi-mobile-core'
import { ConsoleLogger, DidCommSDK, LogLevel } from '@credebl/ssi-mobile-didcomm'
import { OpenID4VCSDK } from '@credebl/ssi-mobile-openid4vc'

export type Modules = {
  openid: OpenID4VCSDK
  didcomm: DidCommSDK
}

async function getTrustedCerts(): Promise<string[]> {
  try {
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
  } catch (error) {
    console.error('Error fetching trusted certificates:', error)
    throw error
  }
}

export const createConfig = (walletId?: string, walletKey?: string): MobileSDKOptions<Modules> => ({
  agentConfig: {
    allowInsecureHttpUrls: true,
    logger: new ConsoleLogger(LogLevel.debug),
  },
  askarConfig: {
    id: walletId || 'CREDEBL-wallet',
    key: walletKey || 'CREDEBL-wallet-key',
  },
  modules: {
    didcomm: new DidCommSDK({}),
    openid: new OpenID4VCSDK({
      getTrustedCertificatesForVerification: async (agentContext, { certificateChain, verification }) => {
        const certs: string[] = await getTrustedCerts()
        return certs
      },
    }),
  },
})

export const useSdk = () => {
  const { sdk } = useMobileSDK<Modules>()
  return { sdk }
}
