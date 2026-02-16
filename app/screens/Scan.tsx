import { DidCommConnectionRecord, DidCommMessageReceiver, parseInvitationUrl } from '@credebl/ssi-mobile-didcomm'
import { getOID4VCCredentialsForProofRequest } from '@credebl/ssi-mobile-openid4vc'
// eslint-disable-next-line import/no-extraneous-dependencies
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, Platform } from 'react-native'
import { check, Permission, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import Toast from 'react-native-toast-message'

import { saveHistory } from '../components/History/HistoryManager'
import { HistoryCardType, HistoryRecord } from '../components/History/types'
import NewQRView from '../components/misc/NewQRView'
import QRScanner from '../components/misc/QRScanner'
import CameraDisclosureModal from '../components/modals/CameraDisclosureModal'
import LoadingModal from '../components/modals/LoadingModal'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { useStore } from '../contexts/store'
import { BifoldError, QrCodeScanError } from '../types/error'
import { ConnectStackParams, Screens, Stacks } from '../types/navigators'
import { PermissionContract } from '../types/permissions'
import { useSdk } from '../utils/agent'
import {
  checkIfAlreadyConnected,
  connectFromInvitation,
  fetchUrlData,
  getConnectionName,
  getJson,
  getUrl,
  isValidUrl,
  receiveMessageFromUrlRedirect,
} from '../utils/helpers'

export type ScanProps = StackScreenProps<ConnectStackParams>

// Define the barcode scan event interface for react-native-vision-camera
export interface VisionCameraCodeScanEvent {
  data: string
}

const Scan: React.FC<ScanProps> = ({ navigation, route }) => {
  const { sdk } = useSdk()
  const { t } = useTranslation()
  const [store] = useStore()
  const [loading, setLoading] = useState<boolean>(true)
  const [showDisclosureModal, setShowDisclosureModal] = useState<boolean>(true)
  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)
  let defaultToConnect = false
  if (route?.params && route.params['defaultToConnect']) {
    defaultToConnect = route.params['defaultToConnect']
  }
  const resolveOpenIDPresentationRequest = useCallback(
    async (uri: string | undefined) => {
      if (!sdk) {
        return
      }
      try {
        const record = await getOID4VCCredentialsForProofRequest({
          agent: sdk,
          uri: uri,
        })
        return record
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1043'),
          t('Error.Message1043'),
          (err as Error)?.message ?? err,
          1043,
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      }
    },
    [sdk, t],
  )

  const logHistoryRecord = async (connectionRecord: DidCommConnectionRecord | undefined) => {
    const contactLabel: string | void = await getConnectionName(connectionRecord)

    try {
      if (!(sdk && store.preferences.useHistoryCapability)) {
        return
      }
      const type = HistoryCardType.Connection
      if (!connectionRecord) {
        return
      }

      try {
        // Prepare the history record object
        const recordData: HistoryRecord = {
          type: type,
          message: type,
          createdAt: connectionRecord?.createdAt, // Assuming `data` has `createdAt` field
          correspondenceId: connectionRecord?.id,
          connection: contactLabel,
        }
        // Save the history record asynchronously
        await saveHistory(recordData, sdk)
      } catch (error) {
        // error when save history
      }
    } catch (err: unknown) {
      // error when agent and preferences not getting
    }
  }

  const handleInvitationUrls = (url: string) => {
    return parseInvitationUrl(url)
  }
  const handleInvitation = async (value: string): Promise<void> => {
    try {
      setLoading(true)
      const response = handleInvitationUrls(value)
      if (response?.success) {
        const invitationData = response.result
        if (invitationData.type === 'openid-credential-offer') {
          const uri = invitationData.format === 'url' ? (invitationData.data as string) : undefined
          // const data =
          //   invitationData.format === 'parsed' ? encodeURIComponent(JSON.stringify(invitationData.data)) : undefined
          if (typeof uri === 'string') {
            setLoading(false)
            navigation.getParent()?.navigate(Stacks.NotificationStack, {
              screen: Screens.OpenIdCredentialOffer,
              params: { uri },
            })
          } else {
            setLoading(false)
          }
        }
        if (invitationData.type === 'openid-authorization-request') {
          const uri = invitationData.data as string
          resolveOpenIDPresentationRequest(uri).then(value => {
            setLoading(false)
            navigation.getParent()?.navigate(Stacks.NotificationStack, {
              screen: Screens.OpenIDProofPresentation,
              params: { credential: value },
            })
          })
        }
        return
      }

      const isAlreadyConnected = await checkIfAlreadyConnected(sdk, value)

      if (isAlreadyConnected) {
        setLoading(false)

        Toast.show({
          type: ToastType.Warn,
          text1: t('Contacts.AlreadyConnected'),
        })
        navigation.goBack()
        return
      }

      const { connectionRecord, outOfBandRecord } = await connectFromInvitation(sdk, value)
      setLoading(false)
      logHistoryRecord(connectionRecord)
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: connectionRecord?.id, outOfBandId: outOfBandRecord.id },
      })
    } catch (err: unknown) {
      try {
        // if scanned value is json -> pass into AFJ as is
        const json = getJson(value)
        if (json) {
          const messageReceiver = sdk.agent?.dependencyManager.resolve(DidCommMessageReceiver)
          await messageReceiver.receiveMessage(json)
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
          const isAlreadyConnected = await checkIfAlreadyConnected(sdk, urlData)

          if (isAlreadyConnected) {
            setLoading(false)

            Toast.show({
              type: ToastType.Warn,
              text1: t('Contacts.AlreadyConnected'),
            })
            navigation.goBack()
            return
          }

          const { connectionRecord, outOfBandRecord } = await connectFromInvitation(sdk, urlData)
          setLoading(false)
          logHistoryRecord(connectionRecord)
          navigation.getParent()?.navigate(Stacks.ConnectionStack, {
            screen: Screens.Connection,
            params: { connectionId: connectionRecord?.id, outOfBandId: outOfBandRecord.id },
          })
          return
        }
        // if scanned value is url -> receive message from it

        const url = getUrl(value)

        if (url) {
          const message = await receiveMessageFromUrlRedirect(value, sdk)
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

  const handleCodeScan = async (event: VisionCameraCodeScanEvent) => {
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
