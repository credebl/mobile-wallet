import { BrandingOverlayType, RemoteOCABundleResolver } from '@hyperledger/aries-oca/build/legacy'
import { Config } from 'react-native-config'

import defaultIndyLedgers from '../configs/ledgers/indy'
import { useProofRequestTemplates } from '../verifier'

import EmptyList from './components/misc/EmptyList'
import Record from './components/record/Record'
import HomeContentView from './components/views/HomeContentView'
import { PINRules } from './constants'
import { ConfigurationContext } from './contexts/configuration'
import { useNotifications } from './hooks/notifications'
import Developer from './screens/Developer'
import OnboardingPages from './screens/OnboardingPages'
import Scan from './screens/Scan'
import Splash from './screens/Splash'
import Terms from './screens/Terms'
import UseBiometry from './screens/UseBiometry'

export const defaultConfiguration: ConfigurationContext = {
  pages: OnboardingPages,
  splash: Splash,
  terms: Terms,
  developer: Developer,
  homeContentView: HomeContentView,
  credentialListHeaderRight: () => null,
  credentialListOptions: () => null,
  credentialEmptyList: EmptyList,
  OCABundleResolver: new RemoteOCABundleResolver(Config.OCA_URL ?? '', {
    brandingOverlayType: BrandingOverlayType.Branding10,
    preLoad: true,
  }),
  proofTemplateBaseUrl: Config.PROOF_TEMPLATE_URL ?? '',
  scan: Scan,
  useBiometry: UseBiometry,
  record: Record,
  PINSecurity: { rules: PINRules, displayHelper: false },
  indyLedgers: defaultIndyLedgers,
  settings: [],
  customNotification: {
    component: () => null,
    onCloseAction: () => null,
    title: '',
    description: '',
    buttonTitle: '',
    pageTitle: '',
  },
  useCustomNotifications: useNotifications,
  proofRequestTemplates: useProofRequestTemplates,
  enableTours: false,
  enableWalletNaming: true,
  enableBackupWallet: true,
}
