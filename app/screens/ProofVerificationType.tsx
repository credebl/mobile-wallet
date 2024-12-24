import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { View, StyleSheet, Text, Platform } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { requestPermissions } from '../services/bluetooth/bluetooth'
import { Screens } from '../types/navigators'

const ProofVerificationType: React.FC = () => {
  const { TextTheme, ColorPallet } = useTheme()
  const navigation = useNavigation()
  const [, dispatch] = useStore()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: 20,
    },
    instructionsText: {
      fontSize: 16,
      color: ColorPallet.brand.primary,
      marginVertical: 10,
    },
    walletButtonView: {
      marginVertical: 50,
      justifyContent: 'center',
    },
    restoreWalletView: {
      marginTop: 20,
    },
    subHeader: {
      marginLeft: 20,
    },
  })

  const proceedToProofRequestsScreen = async (verificationType: 'online' | 'bluetooth') => {
    if (verificationType === 'bluetooth') {
      if (Platform.OS === 'android') {
        await requestPermissions()
      }
      dispatch({
        type: DispatchAction.BLE_ROLE,
        payload: ['verifier'],
      })
    }

    dispatch({
      type: DispatchAction.PROOF_VERIFICATION_TYPE,
      payload: [verificationType],
    })

    navigation.navigate(Screens.ProofRequests as never, { connectionId: undefined })
  }

  return (
    <View style={styles.container}>
      <View>
        {/* <Text style={[TextTheme.normal, { fontWeight: 'bold' }]}>{t('Biometry.UseToUnlock')}</Text> */}
        <Text></Text>
        <Text style={[TextTheme.normal, { fontWeight: 'bold' }]}>1. Online Verification</Text>
        <View style={styles.subHeader}>
          <Text style={TextTheme.normal}>Fast and secure verification over the internet.</Text>
        </View>
        <Text></Text>
        <Text style={[TextTheme.normal, { fontWeight: 'bold' }]}>2. Bluetooth Verification</Text>
        <View style={styles.subHeader}>
          <Text style={TextTheme.normal}>Securely verify via Bluetooth</Text>
        </View>
      </View>
      <View style={styles.walletButtonView}>
        <Button
          title={'Verify Online'}
          buttonType={ButtonType.Primary}
          accessibilityLabel={'okay'}
          onPress={() => proceedToProofRequestsScreen('online')}
        />
        <View style={styles.restoreWalletView}>
          <Button
            title={'Verify Over Bluetooth'}
            buttonType={ButtonType.Primary}
            onPress={() => proceedToProofRequestsScreen('bluetooth')}
            accessibilityLabel={'okay'}
          />
        </View>
      </View>
    </View>
  )
}

export default ProofVerificationType
