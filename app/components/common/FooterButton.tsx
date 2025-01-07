import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { ColorPallet } from '../../theme'
import { testIdWithKey } from '../../utils/testable'
import RecordLoading from '../animated/RecordLoading'
import Button, { ButtonType } from '../buttons/Button'

type FooterProps = {
  loading: boolean
  handleAcceptTouched: () => void
  toggleDeclineModalVisible: () => void
  buttonsVisible: boolean
}
const CommonFooter: React.FC<FooterProps> = ({
  loading,
  buttonsVisible,
  handleAcceptTouched,
  toggleDeclineModalVisible,
}) => {
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    openIdFooterButton: {
      paddingTop: 10,
    },
    header: {
      paddingHorizontal: 25,
      paddingVertical: 16,
      paddingBottom: 26,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
  })
  return (
    <View style={styles.header}>
      {loading ? <RecordLoading /> : null}
      <View style={styles.openIdFooterButton}>
        <Button
          title={t('Global.Accept')}
          accessibilityLabel={t('Global.Accept')}
          testID={testIdWithKey('AcceptCredentialOffer')}
          buttonType={ButtonType.Primary}
          onPress={handleAcceptTouched}
          disabled={!buttonsVisible}
        />
      </View>
      <View style={styles.openIdFooterButton}>
        <Button
          title={t('Global.Decline')}
          accessibilityLabel={t('Global.Decline')}
          testID={testIdWithKey('DeclineCredentialOffer')}
          buttonType={ButtonType.Secondary}
          onPress={toggleDeclineModalVisible}
          disabled={!buttonsVisible}
        />
      </View>
    </View>
  )
}

export default CommonFooter
