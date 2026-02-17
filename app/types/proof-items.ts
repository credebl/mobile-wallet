import { DidCommCredentialExchangeRecord } from '@credebl/ssi-mobile-didcomm'
import { Attribute, Predicate } from '@hyperledger/aries-oca/build/legacy'

export interface ProofCredentialAttributes {
  altCredentials?: string[]
  credExchangeRecord?: DidCommCredentialExchangeRecord
  credId: string
  credDefId?: string
  schemaId?: string
  credName: string
  attributes?: Attribute[]
  inputDescriptorIds?: string[]
}

export interface ProofCredentialPredicates {
  altCredentials?: string[]
  credExchangeRecord?: DidCommCredentialExchangeRecord
  credId: string
  credDefId?: string
  schemaId?: string
  credName: string
  predicates?: Predicate[]
}

export interface ProofCredentialItems extends ProofCredentialAttributes, ProofCredentialPredicates {}

export type W3cIssuerJson = {
  id: string
}

export type W3cCredentialSubjectJson = {
  id?: string
  [key: string]: unknown
}

export type W3cCredentialJson = {
  type: Array<string>
  issuer: W3cIssuerJson
  issuanceDate: string
  expiryDate?: string
  credentialSubject: W3cCredentialSubjectJson | W3cCredentialSubjectJson[]
}
