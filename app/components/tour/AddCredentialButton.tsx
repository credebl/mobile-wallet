import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, DeviceEventEmitter } from 'react-native'
import { MaterialIcons } from '@react-native-vector-icons/material-icons'

import { useTheme } from '../../contexts/theme'
import { WalletEventTypes } from '../../types/events/eventTypes'
import { testIdWithKey } from '../../utils/testable'

const AddCredentialButton: React.FC = () => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const activateSlider = useCallback(() => {
    DeviceEventEmitter.emit(WalletEventTypes.ADD_CREDENTIAL_PRESSED, true)
  }, [])

  const styles = StyleSheet.create({
    button: {
      paddingHorizontal: 16,
    },
  })
  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={t('Credentials.AddCredential')}
      testID={testIdWithKey('AddCredential')}
      style={styles.button}
      onPress={activateSlider}>
      <MaterialIcons name="plus-circle-outline" size={24} color={ColorPallet.grayscale.white} />
    </TouchableOpacity>
  )
}

export default AddCredentialButton
