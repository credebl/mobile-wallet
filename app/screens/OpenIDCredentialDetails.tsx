import { getCredentialForDisplay } from '@adeya/ssi'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, FlatList, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import OpenIdCredentialCard from '../components/OpenId/OpenIDCredentialCard'
import { useOpenIDCredentials } from '../components/Provider/OpenIDCredentialRecordProvider'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import RecordField from '../components/record/RecordField'
import RecordFooter from '../components/record/RecordFooter'
import RecordHeader from '../components/record/RecordHeader'
import RecordRemove from '../components/record/RecordRemove'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { useTheme } from '../contexts/theme'
import { TextTheme } from '../theme'
import { DeliveryStackParams, Screens } from '../types/navigators'
import { ModalUsage } from '../types/remove'
import { useAppAgent } from '../utils/agent'
import { buildFieldsFromOpenIDTemplate } from '../utils/credential'
import { testIdWithKey } from '../utils/testable'

type OpenIDCredentialDetailsProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDCredentialDetails>

const OpenIDCredentialDetails: React.FC<OpenIDCredentialDetailsProps> = ({ navigation, route }) => {
  // FIXME: change params to accept credential id to avoid 'non-serializable' warnings
  const { credential } = route.params
  const credentialDisplay = getCredentialForDisplay(credential)
  const { display, attributes } = credentialDisplay
  const fields = buildFieldsFromOpenIDTemplate(attributes)
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const { agent } = useAppAgent()
  const { removeCredential } = useOpenIDCredentials()
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState(false)

  const toggleDeclineModalVisible = () => setIsRemoveModalDisplayed(!isRemoveModalDisplayed)

  const handleRemove = async () => {
    try {
      await removeCredential(agent, credential)
      navigation.pop()

      // FIXME: This delay is a hack so that the toast doesn't appear until the modal is dismissed
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
    handleRemove()
  }

  const header = () => {
    return (
      <>
        {credential && (
          <View style={{ marginHorizontal: 15, marginBottom: 16, marginTop: 10 }}>
            <OpenIdCredentialCard credentialRecord={credential} />
          </View>
        )}
      </>
    )
  }

  const footer = () => {
    const paddingHorizontal = 24
    const paddingVertical = 16
    return (
      <View style={{ marginBottom: 50 }}>
        <>
          <View
            style={{
              backgroundColor: ColorPallet.brand.secondaryBackground,
              marginTop: paddingVertical,
              paddingHorizontal,
              paddingVertical,
            }}>
            <Text testID={testIdWithKey('IssuerName')}>
              <Text style={[TextTheme.title]}>{t('CredentialDetails.IssuedBy') + ' '}</Text>
              <Text style={[TextTheme.normal]}>{display.issuer.name || t('ContactDetails.AContact')}</Text>
            </Text>
          </View>
          <RecordRemove onRemove={toggleDeclineModalVisible} />
        </>
      </View>
    )
  }

  const body = () => {
    return (
      <FlatList
        data={fields}
        keyExtractor={({ name }, index) => name || index.toString()}
        renderItem={({ item: attr, index }) => (
          <RecordField
            field={attr}
            hideFieldValue={false}
            shown={true}
            hideBottomBorder={index === fields.length - 1}
          />
        )}
        ListHeaderComponent={<RecordHeader>{header()}</RecordHeader>}
        ListFooterComponent={footer ? <RecordFooter>{footer()}</RecordFooter> : null}
      />
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {body()}
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
