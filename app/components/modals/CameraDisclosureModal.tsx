import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '../../contexts/theme'
import { Screens, Stacks, HomeStackParams, TabStacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'

import DismissiblePopupModal from './DismissiblePopupModal'

interface CameraDisclosureModalProps {
  requestCameraUse: () => Promise<boolean>
}

const CameraDisclosureModal: React.FC<CameraDisclosureModalProps> = ({ requestCameraUse }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [requestInProgress, setRequestInProgress] = useState(false)
  const [showExitButton, setShowExitButton] = useState(false)
  const { ColorPallet, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      // flex: 1,
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      padding: 20,
    },
    messageText: {
      marginTop: 30,
    },
    controlsContainer: {
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      marginTop: 'auto',
      margin: 20,
    },
    buttonContainer: {
      paddingTop: 10,
    },
  })

  const onAllowTouched = async () => {
    setRequestInProgress(true)
    const granted = await requestCameraUse()
    if (!granted) {
      setShowSettingsPopup(true)
    }
    setRequestInProgress(false)
  }

  // const onOpenSettingsTouched = async () => {
  //   await Linking.openSettings()
  //   navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  // }

  const onNotNowTouched = () => {
    navigation.getParent()?.navigate(Stacks.TabStack, { screen: TabStacks.HomeStack, params: { screen: Screens.Home } })
  }

  const onOpenSettingsDismissed = () => {
    setShowSettingsPopup(false)
    setShowExitButton(true)
  }

  return (
    <SafeAreaView style={{ backgroundColor: ColorPallet.brand.modalPrimaryBackground, flex: 1 }}>
      {showSettingsPopup && (
        <DismissiblePopupModal
          title={t('CameraDisclosure.AllowCameraUse')}
          description={t('CameraDisclosure.ToContinueUsing')}
          onCallToActionLabel={t('CameraDisclosure.OpenSettings')}
          // onCallToActionPressed={onOpenSettingsTouched}
          onDismissPressed={onOpenSettingsDismissed}
        />
      )}
      <ScrollView style={[styles.container]}>
        <Text style={[TextTheme.modalHeadingOne]} testID={testIdWithKey('AllowCameraUse')}>
          {t('CameraDisclosure.AllowCameraUse')}
        </Text>
        <Text style={[TextTheme.modalNormal, styles.messageText]}>{t('CameraDisclosure.CameraDisclosure')}</Text>
        {/* <Text style={[TextTheme.modalNormal, styles.messageText]}>{t('CameraDisclosure.ToContinueUsing')}</Text> */}
      </ScrollView>
      <View style={[styles.controlsContainer]}>
        {!showExitButton ? (
          <View style={styles.buttonContainer}>
            <Button
              title={t('CameraDisclosure.Continue')}
              accessibilityLabel={t('CameraDisclosure.Continue')}
              testID={testIdWithKey('Continue')}
              onPress={onAllowTouched}
              buttonType={ButtonType.ModalPrimary}
              disabled={requestInProgress}
            />
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              title={t('Global.Cancel')}
              accessibilityLabel={t('Global.Cancel')}
              testID={testIdWithKey('Cancel')}
              onPress={onNotNowTouched}
              buttonType={ButtonType.ModalSecondary}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default CameraDisclosureModal
