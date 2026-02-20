import type { StackScreenProps } from '@react-navigation/stack'

import { DidCommDidExchangeState, deleteConnectionRecordById, useProofById } from '@credebl/ssi-mobile-didcomm'
import { useIsFocused } from '@react-navigation/core'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BackHandler,
  DeviceEventEmitter,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  ProofCustomMetadata,
  ProofMetadata,
  isPresentationFailed,
  isPresentationReceived,
  linkProofWithTemplate,
  sendProofRequest,
} from '../../verifier'
import LoadingIndicator from '../components/animated/LoadingIndicator'
import Button, { ButtonType } from '../components/buttons/Button'
import QRRenderer from '../components/misc/QRRenderer'
import { EventTypes } from '../constants'
import { useTheme } from '../contexts/theme'
import { useConnectionByOutOfBandId, useOutOfBandByConnectionId } from '../hooks/connections'
import { useTemplate } from '../hooks/proof-request-templates'
import { BifoldError } from '../types/error'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { useSdk } from '../utils/agent'
import { createTempConnectionInvitation } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ProofRequestingProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequesting>

const { width, height } = Dimensions.get('window')
const aspectRatio = height / width
const isTablet = aspectRatio < 1.6 // assume 4:3 for tablets
const qrContainerSize = isTablet ? width - width * 0.3 : width - 20
const qrSize = qrContainerSize - 20

const ProofRequesting: React.FC<ProofRequestingProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  // eslint-disable-next-line no-unsafe-optional-chaining
  const { templateId, predicateValues } = route?.params

  const { sdk } = useSdk()
  if (!sdk) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const isFocused = useIsFocused()
  const [generating, setGenerating] = useState(true)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [connectionRecordId, setConnectionRecordId] = useState<string | undefined>(undefined)
  const [proofRecordId, setProofRecordId] = useState<string | undefined>(undefined)
  const record = useConnectionByOutOfBandId(connectionRecordId ?? '')
  const proofRecord = useProofById(proofRecordId ?? '')
  const template = useTemplate(templateId)

  const goalCode = useOutOfBandByConnectionId(sdk, record?.id ?? '')?.outOfBandInvitation.goalCode

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPallet.grayscale.white,
    },
    headerContainer: {
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 30,
      textAlign: 'center',
    },
    primaryHeaderText: {
      fontWeight: 'bold',
      fontSize: 28,
      textAlign: 'center',
      color: ColorPallet.grayscale.black,
    },
    secondaryHeaderText: {
      fontWeight: 'normal',
      fontSize: 20,
      textAlign: 'center',
      marginTop: 8,
      color: ColorPallet.grayscale.black,
    },
    interopText: {
      alignSelf: 'center',
      marginBottom: -20,
      paddingHorizontal: 10,
      backgroundColor: ColorPallet.grayscale.white,
      zIndex: 100,
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 22,
      color: ColorPallet.brand.primary,
    },
    qrContainer: {
      height: qrContainerSize,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
      marginTop: 15,
    },
    buttonContainer: {
      marginTop: 'auto',
      marginHorizontal: 20,
    },
    footerButton: {
      marginBottom: 10,
    },
  })

  const createProofRequest = useCallback(async () => {
    try {
      setMessage(undefined)
      setGenerating(true)
      const result = await createTempConnectionInvitation(sdk, 'verify')
      if (result) {
        setConnectionRecordId(result.record.id)
        setMessage(result.invitationUrl)
      }
    } catch (e) {
      const error = new BifoldError(t('Error.Title1038'), t('Error.Message1038'), (e as Error).message, 1038)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      navigation.goBack()
    } finally {
      setGenerating(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate(Screens.ProofRequests, {})
        return true
      }

      BackHandler.addEventListener('hardwareBackPress', onBackPress)

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, []),
  )

  useEffect(() => {
    if (isFocused) {
      createProofRequest()
    }
  }, [isFocused])

  useEffect(() => {
    if (!template) {
      return
    }

    const sendAsyncProof = async () => {
      if (record && record.state === DidCommDidExchangeState.Completed) {
        //send haptic feedback to verifier that connection is completed
        Vibration.vibrate()
        setGenerating(true)
        // send proof logic
        const result = await sendProofRequest(sdk, template, record.id, predicateValues)
        if (result?.proofRecord) {
          // verifier side doesn't have access to the goal code so we need to add metadata here
          const metadata = result.proofRecord.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
          result.proofRecord.metadata.set(ProofMetadata.customMetadata, { ...metadata, delete_conn_after_seen: true })
          linkProofWithTemplate(sdk, result.proofRecord, templateId)
        }
        setProofRecordId(result?.proofRecord.id)
      }
    }
    sendAsyncProof()
  }, [record, template])

  useEffect(() => {
    if (proofRecord && (isPresentationReceived(proofRecord) || isPresentationFailed(proofRecord))) {
      if (goalCode?.endsWith('verify.once')) {
        deleteConnectionRecordById(sdk, record?.id ?? '')
      }

      setGenerating(true)
      navigation.navigate(Screens.ProofDetails, { recordId: proofRecord.id })
    }
  }, [proofRecord])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView>
        <View style={styles.qrContainer}>
          {generating && <LoadingIndicator />}
          {!generating && message && <QRRenderer value={message} size={qrSize} />}
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.primaryHeaderText}>{t('Verifier.ScanQR')}</Text>
          <Text style={styles.secondaryHeaderText}>{t('Verifier.ScanQRComment')}</Text>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <View style={styles.footerButton}>
          <Button
            title={t('Verifier.RefreshQR')}
            accessibilityLabel={t('Verifier.RefreshQR')}
            testID={testIdWithKey('GenerateNewQR')}
            buttonType={ButtonType.Primary}
            onPress={() => createProofRequest()}
            disabled={generating}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default ProofRequesting
