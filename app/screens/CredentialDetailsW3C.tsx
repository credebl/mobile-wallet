import type { StackScreenProps } from '@react-navigation/stack'
import 'text-encoding'

import {
  CredentialExchangeRecord,
  CredentialState,
  W3cCredentialRecord,
  deleteCredentialExchangeRecordById,
  getW3cCredentialRecordById,
} from '@adeya/ssi'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import Clipboard from '@react-native-clipboard/clipboard'
import * as CryptoJS from 'crypto-js'
import { toString as toQRCodeString } from 'qrcode'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Config } from 'react-native-config'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/MaterialIcons'

import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import RecordRemove from '../components/record/RecordRemove'
import W3CCredentialRecord from '../components/record/W3CCredentialRecord'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { useConnections, useCredentialByState } from '../contexts/agent'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { ContactStackParams, CredentialStackParams, Screens } from '../types/navigators'
import { W3CCredentialAttributeField } from '../types/record'
import { ModalUsage } from '../types/remove'
import { useAppAgent } from '../utils/agent'
import {
  buildFieldsFromJSONLDCredential,
  credentialTextColor,
  formatCredentialSubject,
  getCredentialSubject,
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
  const { agent } = useAppAgent()
  const { t, i18n } = useTranslation()
  const { TextTheme, ColorPallet } = useTheme()
  const { OCABundleResolver } = useConfiguration()
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState<boolean>(false)
  const [tables, setTables] = useState<W3CCredentialAttributeField[]>([])
  const [w3cCredential, setW3cCredential] = useState<W3cCredentialRecord>()
  const credentialsList = useCredentialByState(CredentialState.Done)
  const [isDeletingCredential, setIsDeletingCredential] = useState<boolean>(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false)
  const { records: connectionRecords } = useConnections()

  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({
    bundle: undefined,
    presentationFields: [],
    metaOverlay: undefined,
    brandingOverlay: undefined,
  })

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.brandingOverlay?.primaryBackgroundColor,
      display: 'flex',
    },
    secondaryHeaderContainer: {
      height: 1.5 * logoHeight,
      backgroundColor:
        (overlay.brandingOverlay?.backgroundImage
          ? 'rgba(0, 0, 0, 0)'
          : overlay.brandingOverlay?.secondaryBackgroundColor) ?? 'rgba(0, 0, 0, 0.24)',
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
      color: credentialTextColor(ColorPallet, overlay.brandingOverlay?.primaryBackgroundColor),
      flexShrink: 1,
    },
  })

  useEffect(() => {
    if (!agent || !credential) {
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
          const record = await getW3cCredentialRecordById(agent, credentialRecordId)
          const connection = connectionRecords.find(connection => connection.id === credential?.connectionId)
          record.connectionLabel = connection?.theirLabel
          return record
        }
      }

      updateCredential().then(cred => setW3cCredential(cred))
    }

    if (!w3cCredential) {
      return
    }

    const params = {
      identifiers: {
        schemaId: w3cCredential.credential.type[1],
        credentialDefinitionId: w3cCredential.credential.type[1],
      },
      meta: {
        alias: w3cCredential?.connectionLabel ?? w3cCredential.credential.issuerId,
        credConnectionId: w3cCredential.credential.issuerId,
        credName: w3cCredential.credential.type[1],
      },
      attributes: buildFieldsFromJSONLDCredential(w3cCredential.credential.credentialSubject),
      language: i18n.language,
    }

    const jsonLdValues = formatCredentialSubject(getCredentialSubject(w3cCredential))
    setTables(jsonLdValues)

    OCABundleResolver.resolveAllBundles(params).then(bundle => {
      setOverlay({ ...overlay, ...(bundle as CredentialOverlay<BrandingOverlay>) })
    })
  }, [w3cCredential])

  const handleSubmitRemove = async () => {
    try {
      if (!(agent && credential)) {
        return
      }
      const rec = credentialsList.find(cred => cred.credentials[0]?.credentialRecordId === credential.id)
      setIsDeletingCredential(true)
      if (rec) {
        await deleteCredentialExchangeRecordById(agent, rec.id, {
          deleteAssociatedCredentials: true,
        })
      }
      setIsDeletingCredential(false)
      navigation.pop()

      // FIXME: This delay is a hack so that the toast doesn't appear until the modal is dismissed
      await new Promise(resolve => setTimeout(resolve, 50))

      Toast.show({
        type: ToastType.Success,
        text1: t('CredentialDetails.CredentialRemoved'),
      })
    } catch (err: unknown) {
      setIsDeletingCredential(false)
      const error = new BifoldError(t('Error.Title1032'), t('Error.Message1032'), (err as Error).message, 1025)

      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleCancelRemove = () => {
    setIsRemoveModalDisplayed(false)
  }

  const handleOnRemove = () => {
    setIsRemoveModalDisplayed(true)
  }

  const callOnRemove = useCallback(() => handleOnRemove(), [])
  const callSubmitRemove = useCallback(() => handleSubmitRemove(), [])
  const callCancelRemove = useCallback(() => handleCancelRemove(), [])

  const CredentialCardLogo: React.FC = () => {
    return (
      <View style={styles.logoContainer}>
        {overlay.brandingOverlay?.logo ? (
          <Image
            source={toImageSource(overlay.brandingOverlay?.logo)}
            style={{
              resizeMode: 'cover',
              width: logoHeight,
              height: logoHeight,
              borderRadius: 8,
            }}
          />
        ) : (
          <Text style={[TextTheme.title, { fontSize: 0.5 * logoHeight, color: '#000' }]}>
            {(overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C')?.charAt(0).toUpperCase()}
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
            {overlay.metaOverlay?.issuer}
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
        {overlay.brandingOverlay?.backgroundImage ? (
          <ImageBackground
            source={toImageSource(overlay.brandingOverlay?.backgroundImage)}
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
    return (
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
            <Text style={TextTheme.normal}>{w3cCredential?.connectionLabel ?? ''}</Text>
          </Text>
        </View>
        <RecordRemove onRemove={callOnRemove} />
      </View>
    )
  }
  const handleCopyCredential = () => {
    try {
      const credentialPayload = JSON.stringify(credential, null, 2)
      Clipboard.setString(credentialPayload)
      Toast.show({
        type: ToastType.Success,
        text1: 'CredentialCopied',
        text2: 'Credential Copied',
      })
    } catch (error) {
      Toast.show({
        type: ToastType.Error,
        text1: 'Failed',
        text2: 'Failed To Copy Credential',
      })
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleCopyCredential}
          style={{ marginRight: 15 }}
          testID={testIdWithKey('CopyCredentialButton')}>
          <Icon name="content-copy" size={24} color={'#FFF'} />
        </TouchableOpacity>
      ),
    })
  }, [navigation, credential])
  const generateQRCodeString = async (text: string) => {
    return toQRCodeString(text, {
      width: 95,
      margin: 1,
      color: {
        light: '#0000',
      },
    })
  }

  const navigateToRenderCertificate = async () => {
    try {
      setIsGeneratingPdf(true)

      const certificateAttributes = w3cCredential?.credential.credentialSubject.claims

      const dataToEncrypt = JSON.stringify({
        email: certificateAttributes['email'] ?? 'email',
        schemaUrl: w3cCredential?.credential.contexts[1],
      })

      // eslint-disable-next-line import/namespace
      const encryptedToken = CryptoJS.AES.encrypt(dataToEncrypt, Config.DATA_ENCRYPTION_KEY!).toString()

      const qrCodeSvg = await generateQRCodeString(encryptedToken)

      const prettyVc = w3cCredential?.credential.prettyVc
      let content = prettyVc.certificate

      const contactDetailsPlaceholder = '{{qrcode}}'
      const contactDetailsEscapedPlaceholder = contactDetailsPlaceholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      content = content.replace(new RegExp(contactDetailsEscapedPlaceholder, 'g'), qrCodeSvg)

      Object.keys(certificateAttributes).forEach(key => {
        // Statically picking the value of placeholder
        const placeholder = `{{credential['${key}']}}`
        // Escaping the placeholder to avoid regex issues
        const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        // Replacing the placeholder with the actual value
        let value = certificateAttributes[key]
        if (Array.isArray(value)) {
          value = JSON.stringify(value, null, 2)
        }
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value, null, 2)
        }
        content = content.replace(new RegExp(escapedPlaceholder, 'g'), value)
      })

      setTimeout(() => {
        navigation.navigate(Screens.RenderCertificate, {
          content,
          certificateAttributes,
          w3cCredential,
        })
        setIsGeneratingPdf(false)
      }, 100)
    } catch (error) {
      setIsGeneratingPdf(false)
      // eslint-disable-next-line no-console
      console.log('Error generating pdf : ', error)
    }
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
          w3cCredential={w3cCredential}
          renderCertificate={navigateToRenderCertificate}
          isCertificateLoading={isGeneratingPdf}
        />
      )}
      <CommonRemoveModal
        usage={ModalUsage.CredentialRemove}
        visible={isRemoveModalDisplayed}
        onSubmit={callSubmitRemove}
        onCancel={callCancelRemove}
        disabled={isDeletingCredential}
      />
    </SafeAreaView>
  )
}

export default CredentialDetailsW3C
