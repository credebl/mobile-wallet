import MaterialIcons from '@react-native-vector-icons/material-icons'
import React, { useState } from 'react'
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { QrCodeScanError } from '../../types/error'

import QRScannerClose from './QRScannerClose'
import QRScannerTorch from './QRScannerTorch'
import ScanCamera from './ScanCamera'

interface Props {
  handleCodeScan: (value: string) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
  navigation: any
  isCameraActive: boolean
}

const CameraViewContainer: React.FC<{ portrait: boolean; children: React.ReactNode }> = ({ portrait, children }) => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: portrait ? 'column' : 'row',
        alignItems: 'center',
      }}>
      {children}
    </View>
  )
}

const QRScanner: React.FC<Props> = ({ handleCodeScan, error, enableCameraOnError, navigation, isCameraActive }) => {
  const [torchActive, setTorchActive] = useState(false)
  const { width, height } = useWindowDimensions()
  const portraitMode = height > width
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      height: '100%',
      width: '100%',
      backgroundColor: ColorPallet.grayscale.black,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewFinder: {
      width: 250,
      height: 250,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: ColorPallet.grayscale.white,
    },
    viewFinderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      color: ColorPallet.grayscale.white,
      padding: 4,
    },
  })
  return (
    <View style={styles.container}>
      <ScanCamera
        handleCodeScan={handleCodeScan}
        error={error}
        enableCameraOnError={enableCameraOnError}
        torchActive={torchActive}
        isCameraActive={isCameraActive}
      />
      <CameraViewContainer portrait={portraitMode}>
        <QRScannerClose onPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          {error ? (
            <>
              <MaterialIcons style={styles.icon} name="cancel" size={30} />
              <Text style={[TextTheme.caption, { color: ColorPallet.grayscale.white }]}>{error.message}</Text>
            </>
          ) : (
            <Text style={[TextTheme.caption, { color: ColorPallet.grayscale.white, height: 30, margin: 4 }]}> </Text>
          )}
        </View>
        <View style={styles.viewFinderContainer}>
          <View style={styles.viewFinder} />
        </View>
        <QRScannerTorch active={torchActive} onPress={() => setTorchActive(!torchActive)} />
      </CameraViewContainer>
    </View>
  )
}

export default QRScanner
