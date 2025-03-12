import {
  ClaimFormat,
  getOpenId4VcCredentialMetadata,
  getW3cCredentialDisplay,
  JsonTransformer,
  openId4VcCredentialMetadataKey,
  receiveCredentialFromOpenId4VciOffer,
  SdJwtVcRecord,
  W3cCredentialJson,
  W3cCredentialRecord,
} from '@adeya/ssi'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, DeviceEventEmitter, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { saveHistory } from '../components/History/HistoryManager'
import { HistoryCardType, HistoryRecord } from '../components/History/types'
import OpenIDCredentialCard from '../components/OpenId/OpenIDCredentialCard'
import { useOpenIDCredentials } from '../components/Provider/OpenIDCredentialRecordProvider'
import CommonFooter from '../components/common/FooterButton'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import W3CCredentialRecord from '../components/record/W3CCredentialRecord'
import { EventTypes } from '../constants'
import { useNetwork } from '../contexts/network'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens, TabStacks } from '../types/navigators'
import { W3CCredentialAttributeField } from '../types/record'
import { ModalUsage } from '../types/remove'
import { useAppAgent } from '../utils/agent'
import { buildFieldsFromJSONLDCredential, formatCredentialSubject } from '../utils/credential'
import { testIdWithKey } from '../utils/testable'

type OpenIdCredentialOfferProps = StackScreenProps<NotificationStackParams, Screens.OpenIdCredentialOffer>
type Query = { uri?: string; data?: string }
const OpenIdCredentialOffer: React.FC<OpenIdCredentialOfferProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('OpenIdCredentialOffer route params were not set properly')
  }
  const { agent } = useAppAgent()
  const { t } = useTranslation()
  const { ListItems } = useTheme()
  const { assertConnectedNetwork } = useNetwork()
  const [loading, setLoading] = useState<boolean>(true)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({ presentationFields: [] })
  const [tables, setTables] = useState<W3CCredentialAttributeField[]>([])
  const [credentialRecord, setCredentialRecord] = useState<W3cCredentialRecord | SdJwtVcRecord>()
  const { storeOpenIdCredential } = useOpenIDCredentials()
  const [store] = useStore()
  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    headerText: {
      ...ListItems.recordAttributeLabel,
      flexShrink: 1,
    },
    connectionLabel: {
      fontWeight: 'bold',
    },
    loader: {
      justifyContent: 'center',
      flex: 1,
    },
  })

  const logHistoryRecord = useCallback(async () => {
    try {
      if (!(agent && store.preferences.useHistoryCapability)) {
        return
      }

      const type = HistoryCardType.CardAccepted
      if (!credentialRecord) {
        return
      }

      // Check if the metadata contains the key
      const hasOpenId4VcMetadata = Object.keys(credentialRecord?.metadata?.data || {}).includes(
        openId4VcCredentialMetadataKey,
      )

      if (hasOpenId4VcMetadata) {
        const firstName =
          credentialRecord?.metadata?.data[openId4VcCredentialMetadataKey]?.credential?.display?.[0]?.name
        /** Save history record for card accepted */
        const recordData: HistoryRecord = {
          type: type,
          message: type,
          createdAt: credentialRecord?.createdAt,
          correspondenceId: credentialRecord.id,
          correspondenceName: firstName,
        }
        await saveHistory(recordData, agent)
      }
    } catch (err: unknown) {
      // error when agent and preferences not getting
    }
  }, [agent, store.preferences.useHistoryCapability, credentialRecord])
  useEffect(() => {
    const requestCredential = async (params: Query) => {
      try {
        setLoading(true)
        const credentialRecord = await receiveCredentialFromOpenId4VciOffer({
          agent,
          data: params.data,
          uri: params.uri,
        })
        setCredentialRecord(credentialRecord)
      } catch (e: unknown) {
        agent.config.logger.error(`Couldn't receive credential from OpenID4VCI offer`, {
          error: e,
        })
      } finally {
        setLoading(false)
      }
    }
    requestCredential(route?.params)
  }, [])

  useEffect(() => {
    if (!credentialRecord) {
      return
    }
    const updateOpenIdCredentialPreview = () => {
      const jsonLdValues = formatCredentialSubject(
        (credentialRecord as W3cCredentialRecord).credential.credentialSubject,
      )
      const fields = buildFieldsFromJSONLDCredential(
        (credentialRecord as W3cCredentialRecord).credential.credentialSubject,
      )
      setOverlay({ presentationFields: fields })
      setTables(jsonLdValues)
    }
    updateOpenIdCredentialPreview()
  }, [credentialRecord])
  const toggleDeclineModalVisible = () => setDeclineModalVisible(!declineModalVisible)
  const handleAcceptTouched = async () => {
    try {
      if (!(agent && credentialRecord && assertConnectedNetwork())) {
        return
      }
      await storeOpenIdCredential(agent, credentialRecord)
      logHistoryRecord()
      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(t('Error.Title1024'), t('Error.Message1024'), (err as Error).message, 1024)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }
  const handleDeclineTouched = async () => {
    try {
      toggleDeclineModalVisible()
      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1025'), t('Error.Message1025'), (err as Error).message, 1025)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }
  const openIdHeader = () => {
    const credential = JsonTransformer.toJSON(
      (credentialRecord as W3cCredentialRecord).credential.claimFormat === ClaimFormat.JwtVc
        ? credentialRecord?.credential.credential
        : credentialRecord?.credential,
    ) as W3cCredentialJson
    const openId4Vc = getOpenId4VcCredentialMetadata(credentialRecord as W3cCredentialRecord)
    const showCredential = getW3cCredentialDisplay(credential, openId4Vc)
    return (
      <>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerText]} testID={testIdWithKey('HeaderText')}>
            <Text style={styles.connectionLabel}>{showCredential.name || t('ContactDetails.AContact')}</Text>{' '}
            {t('CredentialOffer.IsOfferingYouACredential')}
          </Text>
        </View>
        {!loading && credentialRecord && (
          <View style={{ marginHorizontal: 15, marginBottom: 16 }}>
            <OpenIDCredentialCard credentialRecord={credentialRecord} />
          </View>
        )}
      </>
    )
  }
  const openIdFooter = () => {
    return (
      <CommonFooter
        loading={loading}
        buttonsVisible={buttonsVisible}
        handleAcceptTouched={handleAcceptTouched}
        toggleDeclineModalVisible={toggleDeclineModalVisible}
      />
    )
  }
  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      {loading ? <ActivityIndicator style={styles.loader} size={'large'} /> : null}
      {credentialRecord ? (
        <W3CCredentialRecord
          tables={tables}
          fields={overlay.presentationFields || []}
          hideFieldValues={false}
          header={openIdHeader}
          footer={openIdFooter}
        />
      ) : null}
      <CommonRemoveModal
        usage={ModalUsage.CredentialOfferDecline}
        visible={declineModalVisible}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </SafeAreaView>
  )
}
export default OpenIdCredentialOffer
