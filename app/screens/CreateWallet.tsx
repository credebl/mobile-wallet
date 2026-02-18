import { useNavigation } from '@react-navigation/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, Text, Platform, Modal, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@react-native-vector-icons/material-icons'

import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'

const CreateWallet: React.FC = () => {
  const { TextTheme, ColorPallet } = useTheme()
  const navigation = useNavigation()
  const { t } = useTranslation()
  const [isModalVisible, setModalVisible] = useState(false)

  const toggleModal = () => {
    setModalVisible(!isModalVisible)
  }

  const proceedWithRestore = () => {
    toggleModal()
    setTimeout(() => {
      navigation.navigate(Screens.ImportWalletVerify as never)
    }, 300)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
    },
    titleText: {
      fontSize: 32,
      fontWeight: '500',
      alignSelf: 'center',
      color: ColorPallet.brand.primary,
      marginTop: 20,
    },
    instructionsText: {
      fontSize: 16,
      color: ColorPallet.brand.primary,
      marginVertical: 10,
    },
    walletButtonView: {
      marginTop: 'auto',
      margin: 20,
    },
    restoreWalletView: {
      marginTop: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    modalContent: {
      backgroundColor: ColorPallet.brand.modalSecondary,
      padding: 22,
      borderRadius: 4,
    },
    modalTitle: {
      fontSize: 24,
      color: ColorPallet.brand.primary,
      fontWeight: 'bold',
    },
  })
  return (
    <View style={styles.container}>
      <Text style={(TextTheme.headingTwo, styles.titleText)}>Welcome</Text>
      <View style={styles.walletButtonView}>
        <Button
          title={'CREATE NEW WALLET'}
          buttonType={ButtonType.Primary}
          accessibilityLabel={'okay'}
          onPress={() => navigation.navigate(Screens.UseBiometry as never)}
        />
        <View style={styles.restoreWalletView}>
          <Button
            title={'RESTORE WALLET'}
            buttonType={ButtonType.Primary}
            onPress={toggleModal}
            accessibilityLabel={'okay'}
          />
        </View>
      </View>
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={toggleModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('Restore.RestoreWallet')}</Text>
              <TouchableOpacity onPress={toggleModal}>
                <MaterialIcons name="close" size={28} color={ColorPallet.brand.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.instructionsText}>{t('Restore.RestoreInstructions')}</Text>
            {Platform.OS === 'ios' && (
              <Text style={styles.instructionsText}>{t('Restore.RestoreInstructionsIOS')}</Text>
            )}
            <View style={styles.restoreWalletView}>
              <Button
                title={'PROCEED'}
                buttonType={ButtonType.Primary}
                onPress={proceedWithRestore}
                accessibilityLabel={'Proceed with restore'}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default CreateWallet
