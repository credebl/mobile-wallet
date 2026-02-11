import {
  ClaimFormat,
  GenericCredentialExchangeRecord,
  getW3cIssuerDisplay,
  JsonTransformer,
  W3cCredentialRecord,
} from '@credebl/ssi-mobile-didcomm'
import {
  W3cCredentialJson,
  getW3cCredentialDisplay,
  getOpenId4VcCredentialMetadata,
} from '@credebl/ssi-mobile-openid4vc'
import React from 'react'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ColorPallet } from '../../theme'

type OpenIdCredentialCardProps = {
  credentialRecord: GenericCredentialExchangeRecord
  onPress?(): void
  textColor?: string
  shadow?: boolean
  credentialFormat?: string
}

export function getTextColorBasedOnBg(bgColor: string) {
  return Number.parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2 ? '#212529' : '#f6f9fc'
}

const OpenIdCredentialCard: React.FC<OpenIdCredentialCardProps> = ({
  credentialRecord,
  textColor,
  onPress,
  credentialFormat,
}) => {
  const credential = JsonTransformer.toJSON(
    (credentialRecord as W3cCredentialRecord).credential.claimFormat === ClaimFormat.JwtVc
      ? credentialRecord?.credential?.credential
      : credentialRecord?.credential,
  ) as W3cCredentialJson
  const openId4VcMetadata = getOpenId4VcCredentialMetadata(credentialRecord as W3cCredentialRecord)
  const issuerShow = getW3cIssuerDisplay(credential, openId4VcMetadata)
  const credentialShow = getW3cCredentialDisplay(credential, openId4VcMetadata)
  const { TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      position: 'relative',
    },
    card: {
      width: '100%',
      borderRadius: 8,
      height: 136,
      overflow: 'hidden',
    },
    backgroundView: {
      width: '100%',
      borderRadius: 8,
      height: '100%',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 8,
    },
    iconContainer: {
      paddingRight: 16,
    },
    textContainer: {
      flex: 1,
      alignItems: 'flex-end',
    },
    heading: {
      fontSize: 16,
      textAlign: 'right',
    },
    subtitle: {
      fontSize: 12,
      textAlign: 'right',
      opacity: 0.8,
    },
    cardFooter: {
      paddingTop: 8,
    },
    footerTextContainer: {
      alignItems: 'flex-start',
    },
    issuerLabel: {
      fontSize: 10,
      opacity: 0.8,
    },
    issuerName: {
      fontSize: 15,
      fontWeight: 'normal',
    },
    cardBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
    },
    backgroundFallback: {
      width: '100%',
      height: '100%',
    },
    cardContainer: {
      flex: 1,
      padding: 16,
      justifyContent: 'space-between',
    },
    formatBadge: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    formatText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
  })

  textColor = credentialShow.textColor
    ? credentialShow.textColor
    : getTextColorBasedOnBg(ColorPallet.brand.primary ?? '#000')

  return (
    <View style={[styles.container, { backgroundColor: ColorPallet.brand.primary }]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: ColorPallet.brand.primary }]}
        onPress={onPress}
        activeOpacity={0.7}>
        <ImageBackground
          source={{ uri: credentialShow?.backgroundImage?.url }}
          style={[styles.backgroundView, { backgroundColor: credentialShow.backgroundColor }]}
          imageStyle={styles.backgroundImage}
          resizeMode="cover">
          {credentialFormat && (
            <View style={styles.formatBadge}>
              <Text style={styles.formatText}>{credentialFormat}</Text>
            </View>
          )}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                {issuerShow?.logo?.url ? (
                  <Image
                    source={{
                      uri: issuerShow.logo.url,
                    }}
                    resizeMode="contain"
                    alt={issuerShow.logo.altText}
                    width={64}
                    height={48}
                  />
                ) : null}
              </View>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    TextTheme.normal,
                    styles.textContainer,
                    {
                      fontWeight: 'bold',
                      lineHeight: 24,
                      flexWrap: 'wrap',
                      color: textColor,
                    },
                  ]}
                  numberOfLines={2}>
                  {credentialShow.name}
                </Text>
                <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={1}>
                  {credentialShow.description}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  )
}

export default OpenIdCredentialCard
