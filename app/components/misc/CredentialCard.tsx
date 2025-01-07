import {
  CredentialExchangeRecord,
  GenericCredentialExchangeRecord,
  openId4VcCredentialMetadataKey,
  W3cCredentialRecord,
} from '@adeya/ssi'
import { Attribute, BrandingOverlayType, Predicate } from '@hyperledger/aries-oca/build/legacy'
import React from 'react'
import { ViewStyle } from 'react-native'

import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import OpenIdCredentialCard from '../OpenId/OpenIDCredentialCard'

import CredentialCard10 from './CredentialCard10'
import CredentialCard11 from './CredentialCard11'

interface CredentialCardProps {
  credential?: GenericCredentialExchangeRecord
  credDefId?: string
  schemaId?: string
  credName?: string
  onPress?: () => void
  style?: ViewStyle
  proof?: boolean
  displayItems?: (Attribute | Predicate)[]
  existsInWallet?: boolean
  connectionLabel?: string
  satisfiedPredicates?: boolean
  hasAltCredentials?: boolean
  handleAltCredChange?: () => void
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  credDefId,
  schemaId,
  proof,
  displayItems,
  credName,
  existsInWallet,
  satisfiedPredicates,
  hasAltCredentials,
  handleAltCredChange,
  style = {},
  onPress = undefined,
  connectionLabel = '',
}) => {
  // add ability to reference credential by ID, allows us to get past react hook restrictions
  const { OCABundleResolver } = useConfiguration()
  const { ColorPallet } = useTheme()
  const getCredOverlayType = (type: BrandingOverlayType) => {
    if (proof) {
      return (
        <CredentialCard11
          displayItems={displayItems}
          style={{ backgroundColor: ColorPallet.brand.secondaryBackground }}
          error={!existsInWallet}
          predicateError={!satisfiedPredicates}
          credName={credName}
          credDefId={credDefId}
          schemaId={schemaId}
          credential={credential as CredentialExchangeRecord}
          handleAltCredChange={handleAltCredChange}
          hasAltCredentials={hasAltCredentials}
          proof
          elevated
          onPress={onPress}
        />
      )
    }

    if (credential instanceof W3cCredentialRecord || credential?.credentialAttributes?.length === 0) {
      return (
        <>
          {Object.keys(credential.metadata.data).includes(openId4VcCredentialMetadataKey) ? (
            <OpenIdCredentialCard credentialRecord={credential} onPress={onPress} />
          ) : (
            <CredentialCard11
              connectionLabel={connectionLabel}
              credDefId={credDefId}
              schemaId={schemaId}
              credName={credName}
              displayItems={displayItems}
              style={style}
              onPress={onPress}
            />
          )}
        </>
      )
    } else if (credential instanceof CredentialExchangeRecord) {
      if (type === BrandingOverlayType.Branding01) {
        return <CredentialCard10 credential={credential} style={style} onPress={onPress} />
      } else {
        return <CredentialCard11 credential={credential} style={style} onPress={onPress} />
      }
    }
  }
  return getCredOverlayType(OCABundleResolver.getBrandingOverlayType())
}

export default CredentialCard
