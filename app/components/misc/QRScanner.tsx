import { useNavigation } from '@react-navigation/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions, Vibration, View, StyleSheet, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera'

import { useTheme } from '../../contexts/theme'
import { QrCodeScanError } from '../../types/error'

import QRScannerClose from './QRScannerClose'
import QRScannerTorch from './QRScannerTorch'

interface VisionCameraCodeScanEvent {
  data: string
}

interface Props {
  handleCodeScan: (event: VisionCameraCodeScanEvent) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
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

const QRScanner: React.FC<Props> = ({ handleCodeScan, error, enableCameraOnError }) => {
  const navigation = useNavigation()
  const [cameraActive, setCameraActive] = useState(true)
  const [torchActive, setTorchActive] = useState(false)
  const { width, height } = useWindowDimensions()
  const portraitMode = height > width
  const { t } = useTranslation()
  const invalidQrCodes = new Set<string>()
  const { ColorPallet, TextTheme } = useTheme()

  const device = useCameraDevice('back')

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        const qrData = codes[0].value

        if (invalidQrCodes.has(qrData)) {
          return
        }

        if (error?.data === qrData) {
          invalidQrCodes.add(error.data)
          if (enableCameraOnError) {
            return setCameraActive(true)
          }
        }

        if (cameraActive) {
          Vibration.vibrate()
          handleCodeScan({ data: qrData })
          setCameraActive(false)
        }
      }
    },
  })

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

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={[TextTheme.normal, { color: ColorPallet.grayscale.white }]}>
          {t('QRScanner.CameraNotAvailable')}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={cameraActive}
        codeScanner={codeScanner}
        torch={torchActive ? 'on' : 'off'}
      />
      <CameraViewContainer portrait={portraitMode}>
        <QRScannerClose onPress={() => navigation.goBack()}></QRScannerClose>
        <View style={styles.errorContainer}>
          {error ? (
            <>
              <Icon style={styles.icon} name="cancel" size={30}></Icon>
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
