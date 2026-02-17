import React, { useCallback, useState } from 'react'
import { StyleSheet, Vibration, View, useWindowDimensions } from 'react-native'
import { Camera, Code, useCameraDevice, useCameraFormat, useCodeScanner } from 'react-native-vision-camera'

import { QrCodeScanError } from '../../types/error'

interface Props {
  handleCodeScan: (value: string) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
  torchActive?: boolean
  isCameraActive: boolean
}

const ScanCamera: React.FC<Props> = ({ handleCodeScan, error, torchActive, isCameraActive }) => {
  const [invalidQrCodes] = useState(new Set<string>())

  const device = useCameraDevice('back')
  const screenAspectRatio = useWindowDimensions().scale
  const format = useCameraFormat(device, [
    { fps: 20 },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: 'max' },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: 'max' },
  ])

  const onCodeScanned = useCallback(
    (codes: Code[]) => {
      const value = codes[0]?.value
      if (!value || invalidQrCodes.has(value) || !isCameraActive) {
        return
      }

      if (error?.data === value) {
        invalidQrCodes.add(value)
        return
      }

      Vibration.vibrate()
      handleCodeScan(value)
    },
    [invalidQrCodes, error, handleCodeScan, isCameraActive],
  )

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: onCodeScanned,
  })

  return (
    <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: '0deg' }] }]}>
      {device && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          torch={torchActive ? 'on' : 'off'}
          isActive={isCameraActive}
          codeScanner={codeScanner}
          format={format}
        />
      )}
    </View>
  )
}

export default ScanCamera
