import Clipboard from '@react-native-clipboard/clipboard'
import MaterialIcons from '@react-native-vector-icons/material-icons'
import React, { useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native'

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
  const [manualUrl, setManualUrl] = useState('')
  const scanningRef = useRef(false)
  const { width, height } = useWindowDimensions()
  const portraitMode = height > width
  const { ColorPallet, TextTheme } = useTheme()

  const submitManualUrl = (urlToSubmit: string) => {
    const trimmed = urlToSubmit.trim()
    if (!trimmed || scanningRef.current) return
    scanningRef.current = true
    handleCodeScan(trimmed)
  }

  const handlePasteAndSubmit = async () => {
    const text = await Clipboard.getString()
    if (text && text.trim()) {
      setManualUrl(text.trim())
      submitManualUrl(text.trim())
    }
  }
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
    manualContainer: {
      width: '90%',
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
      backgroundColor: 'rgba(0,0,0,0.75)',
      borderRadius: 12,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: ColorPallet.grayscale.white,
      color: ColorPallet.grayscale.black,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      fontSize: 13,
      marginRight: 8,
    },
    actionButton: {
      backgroundColor: ColorPallet.brand.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginLeft: 4,
    },
    actionButtonText: {
      color: ColorPallet.grayscale.white,
      fontWeight: 'bold',
      fontSize: 12,
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
        <View style={styles.manualContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Paste QR / Offer / Invitation URL..."
              placeholderTextColor="#888"
              value={manualUrl}
              onChangeText={setManualUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.actionButton} onPress={() => submitManualUrl(manualUrl)}>
              <Text style={styles.actionButtonText}>Go</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handlePasteAndSubmit}>
              <Text style={styles.actionButtonText}>Paste</Text>
            </TouchableOpacity>
          </View>
        </View>
        <QRScannerTorch active={torchActive} onPress={() => setTorchActive(!torchActive)} />
      </CameraViewContainer>
    </View>
  )
}

export default QRScanner
