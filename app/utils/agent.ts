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
      trustedCertificates: [
        'MIIB2zCCAYCgAwIBAgIRALanVqNUK4dgPlUmlAasZ24wCgYIKoZIzj0EAwIwHTEOMAwGA1UEAxMFQW5pbW8xCzAJBgNVBAYTAk5MMB4XDTI0MTEyODE2MjgzMFoXDTI4MTEyODE2MjgzMFowHTEOMAwGA1UEAxMFQW5pbW8xCzAJBgNVBAYTAk5MMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEwDpb2uNodErbJfEWteLF6pGiqaxNfF9rFyttjJy+No0gmzn4wkgYqvGtcX5W4blXT1PQubGml5QUmpm5d41zd6OBoDCBnTAdBgNVHQ4EFgQUVC5XW1PTYNo6yWnkJGgvBVCtWZUwDgYDVR0PAQH/BAQDAgEGMCYGA1UdEgQfMB2GG2h0dHBzOi8vcGxheWdyb3VuZC5hbmltby5pZDASBgNVHRMBAf8ECDAGAQH/AgEAMDAGA1UdHwQpMCcwJaAjoCGGH2h0dHBzOi8vcGxheWdyb3VuZC5hbmltby5pZC9jcmwwCgYIKoZIzj0EAwIDSQAwRgIhAJvXTWWteCIeZPbzn+Y++Lpf4eFTmxP2M5o4phGsLuZcAiEAuiL89d9a2CQbQo8dzNpnV+P9JrUnKRQuP5ZZ9VJcoJI=',
        'MIIBzzCCAXWgAwIBAgIQVwAFolWQim94gmyCic3bCTAKBggqhkjOPQQDAjAdMQ4wDAYDVQQDEwVBbmltbzELMAkGA1UEBhMCTkwwHhcNMjQwNTAyMTQyMzMwWhcNMjgwNTAyMTQyMzMwWjAdMQ4wDAYDVQQDEwVBbmltbzELMAkGA1UEBhMCTkwwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQC/YyBpcRQX8ZXpHfra1TNdSbS7qzgHYHJ3msbIr8TJLPNZI8Ul8zJlFdQVIVls5+5ClCbN+J9FUvhPGs4AzA+o4GWMIGTMB0GA1UdDgQWBBQv3zBo1i/1CfEgdvkIWDGO9lS1SzAOBgNVHQ8BAf8EBAMCAQYwIQYDVR0SBBowGIYWaHR0cHM6Ly9mdW5rZS5hbmltby5pZDASBgNVHRMBAf8ECDAGAQH/AgEAMCsGA1UdHwQkMCIwIKAeoByGGmh0dHBzOi8vZnVua2UuYW5pbW8uaWQvY3JsMAoGCCqGSM49BAMCA0gAMEUCIQCTg80AmqVHJLaZt2uuhAtPqKIXafP2ghtd9OCmdD51ZwIgKvVkrgTYlxSRAbmKY6MlkH8mM3SNcnEJk9fGVwJG++0=',
      ],
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
