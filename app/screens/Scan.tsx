import type { BarCodeReadEvent } from 'react-native-camera'

import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { check, Permission, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import Toast from 'react-native-toast-message'

import NewQRView from '../components/misc/NewQRView'
import QRScanner from '../components/misc/QRScanner'
import CameraDisclosureModal from '../components/modals/CameraDisclosureModal'
import LoadingModal from '../components/modals/LoadingModal'
import { ToastType } from '../components/toast/BaseToast'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { requestPermissions } from '../services/bluetooth'
import { BifoldError, QrCodeScanError } from '../types/error'
import { ConnectStackParams, Screens, Stacks } from '../types/navigators'
import { PermissionContract } from '../types/permissions'
import { useAppAgent } from '../utils/agent'
import {
  checkIfAlreadyConnected,
  connectFromInvitation,
  fetchUrlData,
  getJson,
  getUrl,
  isValidUrl,
  receiveMessageFromUrlRedirect,
} from '../utils/helpers'

export type ScanProps = StackScreenProps<ConnectStackParams>

const Scan: React.FC<ScanProps> = ({ navigation, route }) => {
  const { agent } = useAppAgent()
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const [loading, setLoading] = useState<boolean>(true)
  const [showDisclosureModal, setShowDisclosureModal] = useState<boolean>(true)
  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)
  let defaultToConnect = false
  if (route?.params && route.params['defaultToConnect']) {
    defaultToConnect = route.params['defaultToConnect']
  }

  const handleInvitation = async (value: string): Promise<void> => {
    try {
      setLoading(true)

      if (value.startsWith('ble://')) {
        setLoading(false)

        const serviceUuid = value.split('ble://')[1].split('&')[0].split('service=')[1]
        const proofType = value.split('ble://')[1].split('&')[1].split('type=')[1]

        if (Platform.OS === 'android') {
          await requestPermissions()
        }

        // update ble role
        dispatch({
          type: DispatchAction.BLE_ROLE,
          payload: ['prover'],
        })

        if (proofType === 'indy' || proofType === 'anoncreds') {
          navigation.navigate(Stacks.ContactStack as any, {
            screen: Screens.ProofRequest,
            params: { serviceUuid },
          })
        } else {
          navigation.navigate(Stacks.ContactStack as any, {
            screen: Screens.ProofRequestW3C,
            params: { serviceUuid },
          })
        }

        return
      }

      const isAlreadyConnected = await checkIfAlreadyConnected(agent, value)

      if (isAlreadyConnected) {
        setLoading(false)

        Toast.show({
          type: ToastType.Warn,
          text1: t('Contacts.AlreadyConnected'),
        })
        navigation.goBack()
        return
      }

      const { connectionRecord, outOfBandRecord } = await connectFromInvitation(agent, value)
      setLoading(false)
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: connectionRecord?.id, outOfBandId: outOfBandRecord.id },
      })
    } catch (err: unknown) {
      try {
        // if scanned value is json -> pass into AFJ as is
        const json = getJson(value)
        if (json) {
          await agent?.receiveMessage(json)
          setLoading(false)
          navigation.getParent()?.navigate(Stacks.ConnectionStack, {
            screen: Screens.Connection,
            params: { threadId: json['@id'] },
          })
          return
        }

        const urlData = await fetchUrlData(value)
        const isValidURL = isValidUrl(urlData)

        if (isValidURL) {
          const isAlreadyConnected = await checkIfAlreadyConnected(agent, urlData)

          if (isAlreadyConnected) {
            setLoading(false)

            Toast.show({
              type: ToastType.Warn,
              text1: t('Contacts.AlreadyConnected'),
            })
            navigation.goBack()
            return
          }

          const { connectionRecord, outOfBandRecord } = await connectFromInvitation(agent, urlData)

          setLoading(false)
          navigation.getParent()?.navigate(Stacks.ConnectionStack, {
            screen: Screens.Connection,
            params: { connectionId: connectionRecord?.id, outOfBandId: outOfBandRecord.id },
          })
          return
        }
        // if scanned value is url -> receive message from it

        const url = getUrl(value)

        if (url) {
          const message = await receiveMessageFromUrlRedirect(value, agent)
          setLoading(false)
          navigation.getParent()?.navigate(Stacks.ConnectionStack, {
            screen: Screens.Connection,
            params: { threadId: message['@id'] },
          })
          return
        }

        setLoading(false)
      } catch (err: unknown) {
        setLoading(false)
        const error = new BifoldError(t('Error.Title1031'), t('Error.Message1031'), (err as Error).message, 1031)
        throw error
      }
    }
  }

  const handleCodeScan = async (event: BarCodeReadEvent) => {
    setQrCodeScanError(null)
    try {
      const uri = event.data
      await handleInvitation(uri)
    } catch (e: unknown) {
      const error = new QrCodeScanError(t('Scan.InvalidQrCode'), event.data)
      setQrCodeScanError(error)
    }
  }

  const permissionFlow = async (method: PermissionContract, permission: Permission): Promise<boolean> => {
    try {
      const permissionResult = await method(permission)
      if (permissionResult === RESULTS.GRANTED) {
        setShowDisclosureModal(false)
        return true
      }
    } catch (error: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (error as Error)?.message || t('Error.Unknown'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    }

    return false
  }

  const requestCameraUse = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      return await permissionFlow(request, PERMISSIONS.ANDROID.CAMERA)
    } else if (Platform.OS === 'ios') {
      return await permissionFlow(request, PERMISSIONS.IOS.CAMERA)
    }

    return false
  }

  useEffect(() => {
    const asyncEffect = async () => {
      if (Platform.OS === 'android') {
        await permissionFlow(check, PERMISSIONS.ANDROID.CAMERA)
      } else if (Platform.OS === 'ios') {
        await permissionFlow(check, PERMISSIONS.IOS.CAMERA)
      }
      setLoading(false)
    }

    asyncEffect()
  }, [])

  if (loading) {
    return <LoadingModal />
  }

  if (showDisclosureModal) {
    return <CameraDisclosureModal requestCameraUse={requestCameraUse} />
  }

  if (store.preferences.useConnectionInviterCapability) {
    return (
      <NewQRView
        defaultToConnect={defaultToConnect}
        handleCodeScan={handleCodeScan}
        error={qrCodeScanError}
        enableCameraOnError={true}
      />
    )
  } else {
    return <QRScanner handleCodeScan={handleCodeScan} error={qrCodeScanError} enableCameraOnError={true} />
  }
}

export default Scan
