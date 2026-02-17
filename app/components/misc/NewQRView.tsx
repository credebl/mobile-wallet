import { DidCommDidExchangeState } from '@credebl/ssi-mobile-didcomm'
import { useNavigation } from '@react-navigation/core'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { useConnectionByOutOfBandId } from '../../hooks/connections'
import { QrCodeScanError } from '../../types/error'
import { Screens, Stacks } from '../../types/navigators'
import { useSdk } from '../../utils/agent'
import { createConnectionInvitation } from '../../utils/helpers'
import LoadingIndicator from '../animated/LoadingIndicator'

import QRRenderer from './QRRenderer'
import QRScannerTorch from './QRScannerTorch'
import ScanCamera from './ScanCamera'
import ScanTab from './ScanTab'

const windowDimensions = Dimensions.get('window')
const qrSize = windowDimensions.width - 40

interface Props {
  defaultToConnect: boolean
  handleCodeScan: (value: string) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
  isCameraActive: boolean
}

const NewQRView: React.FC<Props> = ({
  defaultToConnect,
  handleCodeScan,
  error,
  enableCameraOnError,
  isCameraActive,
}) => {
  const navigation = useNavigation()
  const [store] = useStore()
  const [torchActive, setTorchActive] = useState(false)
  const [firstTabActive, setFirstTabActive] = useState(!defaultToConnect)
  const [invitation, setInvitation] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { sdk } = useSdk()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.brand.secondaryBackground,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    camera: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraViewContainer: {
      alignItems: 'center',
      flex: 1,
      width: '100%',
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
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      paddingHorizontal: 20,
    },
    icon: {
      color: ColorPallet.grayscale.white,
      padding: 4,
    },
    tabContainer: {
      flexDirection: 'row',
      flexShrink: 1,
      width: '100%',
      borderTopWidth: 4,
      borderTopColor: ColorPallet.brand.primaryBackground,
    },
    qrContainer: {
      marginTop: 60,
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
    },
    walletName: {
      ...TextTheme.headingTwo,
      textAlign: 'center',
      marginBottom: 20,
    },
    secondaryText: {
      ...TextTheme.normal,
      textAlign: 'center',
    },
    qrCodeMainContainer: {
      flex: 1,
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    walletNameMainContainer: { paddingHorizontal: 20, flex: 1, marginTop: 20 },
  })

  const createInvitation = useCallback(async () => {
    setInvitation(undefined)
    const result = await createConnectionInvitation(sdk)
    if (result) {
      setRecordId(result.record.id)
      setInvitation(result.invitationUrl)
    }
  }, [])

  useEffect(() => {
    navigation.setOptions({ title: firstTabActive ? 'Scan QR code' : 'My QR code' })
    if (!firstTabActive) {
      createInvitation()
    }
  }, [firstTabActive])

  const record = useConnectionByOutOfBandId(recordId || '')

  useEffect(() => {
    if (record?.state === DidCommDidExchangeState.Completed) {
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: record.id },
      })
    }
  }, [record])

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      {firstTabActive ? (
        <View style={styles.camera}>
          <ScanCamera
            handleCodeScan={handleCodeScan}
            error={error}
            enableCameraOnError={enableCameraOnError}
            torchActive={torchActive}
            isCameraActive={isCameraActive}
          />

          <View style={styles.cameraViewContainer}>
            <View style={styles.errorContainer}>
              {error ? (
                <>
                  <Icon style={styles.icon} name="cancel" size={30}></Icon>
                  <Text style={[TextTheme.normal, { color: ColorPallet.grayscale.white }]}>{error.message}</Text>
                </>
              ) : (
                <Text style={[TextTheme.normal, { color: ColorPallet.grayscale.white }]}>
                  {t('Scan.WillScanAutomatically')}
                </Text>
              )}
            </View>
            <View style={styles.viewFinderContainer}>
              <View style={styles.viewFinder} />
            </View>
            <QRScannerTorch active={torchActive} onPress={() => setTorchActive(!torchActive)} />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.qrCodeMainContainer}>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.qrContainer}>
              {!invitation && <LoadingIndicator />}
              {invitation && <QRRenderer value={invitation} size={qrSize} />}
            </View>
            <View style={styles.walletNameMainContainer}>
              <Text style={styles.walletName}>{store.preferences.walletName}</Text>
              <Text style={styles.secondaryText}>{t('Connection.ShareQR')}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      <View style={styles.tabContainer}>
        <ScanTab
          title={t('Scan.ScanQRCode')}
          iconName={'crop-free'}
          onPress={() => setFirstTabActive(true)}
          active={firstTabActive}
        />
        <ScanTab
          title={t('Scan.MyQRCode')}
          iconName={'qr-code'}
          onPress={() => setFirstTabActive(false)}
          active={!firstTabActive}
        />
      </View>
    </SafeAreaView>
  )
}

export default NewQRView
