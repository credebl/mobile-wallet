import { AnonCredsCredentialMetadataKey, DidCommCredentialExchangeRecord } from '@credebl/ssi-mobile-didcomm'

import { CREDENTIAL } from '../constants'

export function parseSchemaFromId(schemaId?: string): { name: string; version: string } {
  let name = CREDENTIAL
  let version = ''
  if (schemaId) {
    const schemaIdRegex = /(.*?):([0-9]):([a-zA-Z .\-_0-9]+):([a-z0-9._-]+)$/
    const schemaIdParts = schemaId.match(schemaIdRegex)
    if (schemaIdParts?.length === 5) {
      name = `${schemaIdParts?.[3].replace(/_|-/g, ' ')}`
        .split(' ')
        .map(schemaIdPart => schemaIdPart.charAt(0).toUpperCase() + schemaIdPart.substring(1))
        .join(' ')
      version = schemaIdParts?.[4]
    }
  }
  return { name, version }
}

export function credentialSchema(credential: DidCommCredentialExchangeRecord): string | undefined {
  return credential.metadata?.get(AnonCredsCredentialMetadataKey)?.schemaId
}

export function parsedSchema(credential: DidCommCredentialExchangeRecord): { name: string; version: string } {
  return parseSchemaFromId(credentialSchema(credential))
}
