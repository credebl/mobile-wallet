import type { StackScreenProps } from '@react-navigation/stack'

import {
  useAdeyaAgent,
  CredentialExchangeRecord,
  W3cCredentialRecord,
  getW3cCredentialRecordById,
  getAllCredentialExchangeRecords,
  deleteCredentialExchangeRecordById,
} from '@adeya/ssi'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import CredentialCard from '../components/misc/CredentialCard'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import W3CCredentialRecord from '../components/record/W3CCredentialRecord'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { ContactStackParams, CredentialStackParams, Screens } from '../types/navigators'
import { CardLayoutOverlay11, CardOverlayType, CredentialOverlay } from '../types/oca'
import { W3CCredentialAttributeField } from '../types/record'
import { ModalUsage } from '../types/remove'
import {
  buildFieldsFromJSONLDCredential,
  credentialTextColor,
  formatCredentialSubject,
  toImageSource,
} from '../utils/credential'
import { testIdWithKey } from '../utils/testable'

type CredentialDetailsProps = StackScreenProps<CredentialStackParams | ContactStackParams, Screens.CredentialDetailsW3C>

const paddingHorizontal = 24
const paddingVertical = 16
const logoHeight = 80

const CredentialDetailsW3C: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialDetails route prams were not set properly')
  }

  const { credential } = route?.params
  const { agent } = useAdeyaAgent()
  const { t, i18n } = useTranslation()
  const { TextTheme, ColorPallet } = useTheme()
  const { OCABundleResolver } = useConfiguration()
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState<boolean>(false)
  const [tables, setTables] = useState<W3CCredentialAttributeField[]>([])
  const [w3cCredential, setW3cCredential] = useState<W3cCredentialRecord>()

  const [overlay, setOverlay] = useState<CredentialOverlay<CardLayoutOverlay11>>({
    bundle: undefined,
    presentationFields: [],
    metaOverlay: undefined,
    cardLayoutOverlay: undefined,
  })

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.cardLayoutOverlay?.primaryBackgroundColor,
      display: 'flex',
    },
    secondaryHeaderContainer: {
      height: 1.5 * logoHeight,
      backgroundColor:
        (overlay.cardLayoutOverlay?.backgroundImage?.src
          ? 'rgba(0, 0, 0, 0)'
          : overlay.cardLayoutOverlay?.secondaryBackgroundColor) ?? 'rgba(0, 0, 0, 0.24)',
    },
    primaryHeaderContainer: {
      paddingHorizontal,
      paddingVertical,
    },
    statusContainer: {},
    logoContainer: {
      top: -0.5 * logoHeight,
      left: paddingHorizontal,
      marginBottom: -1 * logoHeight,
      width: logoHeight,
      height: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 1,
        height: 1,
      },
      shadowOpacity: 0.3,
    },
    textContainer: {
      color: credentialTextColor(ColorPallet, overlay.cardLayoutOverlay?.primaryBackgroundColor),
      flexShrink: 1,
    },
  })

  useEffect(() => {
    if (!agent) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1033'), t('Error.Message1033'), t('CredentialDetails.CredentialNotFound'), 1033),
      )
    }
  }, [])

  useEffect(() => {
    if (!credential) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1033'), t('Error.Message1033'), t('CredentialDetails.CredentialNotFound'), 1033),
      )
    }
  }, [])

  useEffect(() => {
    if (!w3cCredential) {
      const updateCredential = async () => {
        if (!agent) {
          return
        }
        if (credential instanceof W3cCredentialRecord) {
          return credential
        } else if (credential instanceof CredentialExchangeRecord) {
          const credentialRecordId = credential.credentials[0].credentialRecordId
          const record = await getW3cCredentialRecordById(credentialRecordId)
          return record
        }
      }

      updateCredential().then(cred => setW3cCredential(cred))
    }

    if (!(w3cCredential instanceof W3cCredentialRecord)) {
      return
    }

    const params = {
      identifiers: {
        schemaId: w3cCredential.credential.type[1],
        credentialDefinitionId: w3cCredential.credential.type[1],
      },
      meta: {
        alias: w3cCredential.credential.issuerId,
        credConnectionId: w3cCredential.credential.issuerId,
        credName: w3cCredential.credential.type[1],
      },
      attributes: buildFieldsFromJSONLDCredential(w3cCredential.credential.credentialSubject),
      language: i18n.language,
    }

    const jsonLdValues = formatCredentialSubject(w3cCredential.credential.credentialSubject)
    setTables(jsonLdValues)

    OCABundleResolver.resolveAllBundles(params).then(bundle => {
      setOverlay({ ...overlay, ...bundle })
    })
  }, [w3cCredential])

  const handleSubmitRemove = async () => {
    try {
      if (!credential) {
        return
      }
      const credentialList = await getAllCredentialExchangeRecords()
      const rec = credentialList.find(cred => cred.credentials[0]?.credentialRecordId === credential.id)
      if (rec) {
        await deleteCredentialExchangeRecordById(rec.id)
      }
      Toast.show({
        type: ToastType.Success,
        text1: t('CredentialDetails.CredentialRemoved'),
      })

      navigation.pop()
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1032'), t('Error.Message1032'), (err as Error).message, 1025)

      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleCancelRemove = () => {
    setIsRemoveModalDisplayed(false)
  }

  const callSubmitRemove = useCallback(() => handleSubmitRemove(), [])
  const callCancelRemove = useCallback(() => handleCancelRemove(), [])

  const CredentialCardLogo: React.FC = () => {
    return (
      <View style={styles.logoContainer}>
        {overlay.cardLayoutOverlay?.logo?.src ? (
          <Image
            source={toImageSource(overlay.cardLayoutOverlay?.logo.src)}
            style={{
              resizeMode: 'cover',
              width: logoHeight,
              height: logoHeight,
              borderRadius: 8,
            }}
          />
        ) : (
          <Text style={[TextTheme.title, { fontSize: 0.5 * logoHeight, color: '#000' }]}>
            {(overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuerName ?? 'C')?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    )
  }

  const CredentialDetailPrimaryHeader: React.FC = () => {
    return (
      <View testID={testIdWithKey('CredentialDetailsPrimaryHeader')} style={styles.primaryHeaderContainer}>
        <View>
          <Text
            testID={testIdWithKey('CredentialIssuer')}
            style={[
              TextTheme.label,
              styles.textContainer,
              {
                paddingLeft: logoHeight + paddingVertical,
                paddingBottom: paddingVertical,
                lineHeight: 19,
                opacity: 0.8,
              },
            ]}
            numberOfLines={1}>
            {overlay.metaOverlay?.issuerName}
          </Text>
          <Text
            testID={testIdWithKey('CredentialName')}
            style={[
              TextTheme.normal,
              styles.textContainer,
              {
                lineHeight: 24,
              },
            ]}>
            {overlay.metaOverlay?.name}
          </Text>
        </View>
      </View>
    )
  }

  const CredentialDetailSecondaryHeader: React.FC = () => {
    return (
      <>
        {overlay.cardLayoutOverlay?.backgroundImage?.src ? (
          <ImageBackground
            source={toImageSource(overlay.cardLayoutOverlay?.backgroundImage.src)}
            imageStyle={{
              resizeMode: 'cover',
            }}>
            <View testID={testIdWithKey('CredentialDetailsSecondaryHeader')} style={styles.secondaryHeaderContainer} />
          </ImageBackground>
        ) : (
          <View testID={testIdWithKey('CredentialDetailsSecondaryHeader')} style={styles.secondaryHeaderContainer} />
        )}
      </>
    )
  }

  const header = () => {
    return OCABundleResolver.cardOverlayType === CardOverlayType.CardLayout10 ? (
      <View>
        {credential && (
          <CredentialCard schemaId={w3cCredential?.credential.context[1] as string} style={{ margin: 16 }} />
        )}
      </View>
    ) : (
      <View style={styles.container}>
        <CredentialDetailSecondaryHeader />
        <CredentialCardLogo />
        <CredentialDetailPrimaryHeader />
      </View>
    )
  }

  const footer = () => {
    return (
      <View style={{ marginBottom: 50 }}>
        <View
          style={{
            backgroundColor: ColorPallet.brand.secondaryBackground,
            marginTop: paddingVertical,
            paddingHorizontal,
            paddingVertical,
          }}>
          <Text testID={testIdWithKey('IssuerName')}>
            <Text style={TextTheme.title}>{t('CredentialDetails.IssuedBy') + ' '}</Text>
            <Text style={TextTheme.normal}>{w3cCredential?.credential.issuerId ?? ''}</Text>
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {w3cCredential && (
        <W3CCredentialRecord
          tables={tables}
          fields={overlay.presentationFields || []}
          hideFieldValues
          header={header}
          footer={footer}
        />
      )}
      <CommonRemoveModal
        usage={ModalUsage.CredentialRemove}
        visible={isRemoveModalDisplayed}
        onSubmit={callSubmitRemove}
        onCancel={callCancelRemove}
      />
    </SafeAreaView>
  )
}

export default CredentialDetailsW3C
