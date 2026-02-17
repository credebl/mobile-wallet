import { IndyVdrPoolConfig } from '@credebl/ssi-mobile-didcomm'

import _ledgers from './ledgers.json'

// type-check the json
const ledgers = _ledgers as [IndyVdrPoolConfig, ...IndyVdrPoolConfig[]]

export default ledgers
