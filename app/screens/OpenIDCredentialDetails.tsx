import { getCredentialForDisplay } from '@adeya/ssi'
import Clipboard from '@react-native-clipboard/clipboard'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/MaterialIcons'

import OpenIdCredentialCard from '../components/OpenId/OpenIDCredentialCard'
import { useOpenIDCredentials } from '../components/Provider/OpenIDCredentialRecordProvider'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import RecordRemove from '../components/record/RecordRemove'
import W3CCredentialRecord from '../components/record/W3CCredentialRecord'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { useTheme } from '../contexts/theme'
import { DeliveryStackParams, Screens } from '../types/navigators'
import { W3CCredentialAttribute } from '../types/record'
import { ModalUsage } from '../types/remove'
import { useAppAgent } from '../utils/agent'
import { buildFieldsFromOpenIDTemplate, sanitizeString } from '../utils/credential'
import { testIdWithKey } from '../utils/testable'

type OpenIDCredentialDetailsProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDCredentialDetails>

const paddingHorizontal = 24
const paddingVertical = 16

const OpenIDCredentialDetails: React.FC<OpenIDCredentialDetailsProps> = ({ navigation, route }) => {
  const { credential } = route.params
  const credentialDisplay = getCredentialForDisplay(credential)
  const { display, attributes, rawAttributes } = credentialDisplay
  const fields = buildFieldsFromOpenIDTemplate(
    attributes && typeof attributes === 'object' && Object.keys(attributes as object).length === 0
      ? rawAttributes
      : (attributes ?? rawAttributes),
  )
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { agent } = useAppAgent()
  const { removeCredential } = useOpenIDCredentials()
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState(false)

  const convertFieldToAttribute = (field: any, level: number = 0): W3CCredentialAttribute => {
    if ('key' in field && 'value' in field) {
      return {
        key: sanitizeString(field.key),
        value: field.value ? String(field.value) : '',
        level,
        shown: true,
        isExpandable: field.isExpandable || false,
        isExpanded: field.isExpanded || false,
        children: field.children
          ? field.children.map((child: any) => convertFieldToAttribute(child, level + 1))
          : undefined,
      }
    } else if ('name' in field) {
      return {
        key: sanitizeString(field.name || 'Unknown'),
        value: field.value ? String(field.value) : '',
        level,
        shown: true,
        isExpandable: field.isExpandable || false,
        isExpanded: field.isExpanded || false,
        children: field.children
          ? field.children.map((child: any) => convertFieldToAttribute(child, level + 1))
          : undefined,
      }
    }
    return {
      key: sanitizeString(('key' in field && field.key) || ('name' in field && field.name) || 'Unknown'),
      value: ('value' in field && field.value) || String(field.value) || '',
      level,
      shown: true,
      isExpandable: field.isExpandable || false,
      isExpanded: field.isExpanded || false,
      children: field.children
        ? field.children.map((child: any) => convertFieldToAttribute(child, level + 1))
        : undefined,
    }
  }

  const tables: W3CCredentialAttribute[] = fields
    .filter(field => {
      const fieldName = 'name' in field ? field.name : 'key' in field ? field.key : ''
      return !(
        fieldName?.includes('age_over_18') ||
        fieldName?.includes('age_over_60') ||
        fieldName?.includes('Age Over 18') ||
        fieldName?.includes('Age Over 60')
      )
    })
    .map(field => convertFieldToAttribute(field, 0))

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

  const toggleDeclineModalVisible = () => setIsRemoveModalDisplayed(!isRemoveModalDisplayed)

  const handleRemove = async () => {
    try {
      await removeCredential(agent, credential)
      navigation.pop()

      await new Promise(resolve => setTimeout(resolve, 50))
      Toast.show({
        type: ToastType.Success,
        text1: t('CredentialDetails.CredentialRemoved'),
      })
    } catch (err) {
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, err)
    }
  }
  const handleDeclineTouched = async () => {
    toggleDeclineModalVisible()
    await handleRemove()
  }

  const header = () => {
    return (
      <View style={{ marginHorizontal: 15, marginBottom: 16, marginTop: 10 }}>
        {credential && <OpenIdCredentialCard credentialRecord={credential} />}
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
            <Text style={TextTheme.normal}>{display.issuer.name || t('ContactDetails.AContact')}</Text>
          </Text>
        </View>
        <RecordRemove onRemove={toggleDeclineModalVisible} />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      <W3CCredentialRecord tables={tables as any} fields={[]} hideFieldValues={true} header={header} footer={footer} />
      <CommonRemoveModal
        usage={ModalUsage.CredentialRemove}
        visible={isRemoveModalDisplayed}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </SafeAreaView>
  )
}

export default OpenIDCredentialDetails
