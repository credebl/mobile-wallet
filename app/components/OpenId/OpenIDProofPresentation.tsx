import {
  ClaimFormat,
  CredentialMetadata,
  DisplayImage,
  formatDifPexCredentialsForRequest,
  sanitizeString,
  shareProof,
  useAdeyaAgent,
} from '@adeya/ssi'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { EventTypes } from '../../constants'
import { useTheme } from '../../contexts/theme'
import ProofRequestAccept from '../../screens/ProofRequestAccept'
import { ListItems, TextTheme } from '../../theme'
import { BifoldError } from '../../types/error'
import { NotificationStackParams, Screens, Stacks, TabStacks } from '../../types/navigators'
import { ModalUsage } from '../../types/remove'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import CommonRemoveModal from '../modals/CommonRemoveModal'

import { OpenIDCredentialRowCard } from './CredentialRowCard'

type OpenIDProofPresentationProps = StackScreenProps<NotificationStackParams, Screens.OpenIDProofPresentation>

const styles = StyleSheet.create({
  pageContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 10,
  },
  credentialsList: {
    marginTop: 20,
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    paddingVertical: 16,
  },
  headerText: {
    ...ListItems.recordAttributeText,
    flexShrink: 1,
  },
  footerButton: {
    paddingTop: 10,
  },
  credActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
})

const OpenIDProofPresentation: React.FC<OpenIDProofPresentationProps> = ({
  navigation,
  route: {
    params: { credential },
  },
}: OpenIDProofPresentationProps) => {
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const [selectedCredId, setSelectedCredId] = useState<string | null>(null)

  const { ColorPallet } = useTheme()
  const { t } = useTranslation()
  const { agent } = useAdeyaAgent()

  const toggleDeclineModalVisible = () => setDeclineModalVisible(!declineModalVisible)

  const submission = useMemo(
    () =>
      credential && credential.credentialsForRequest
        ? formatDifPexCredentialsForRequest(credential.credentialsForRequest)
        : undefined,
    [credential],
  )

  const selectedCredentials = useMemo(() => {
    return submission?.entries.reduce((acc, entry) => {
      // Check if the entry is satisfied and has credentials
      if (entry.isSatisfied) {
        // Iterate through the credentials for the entry
        const selectedCredential = entry.credentials.find(item => item.id === selectedCredId)
        if (selectedCredential) {
          // If found, add it to the accumulator with the appropriate inputDescriptorId
          return { ...acc, [entry.inputDescriptorId]: selectedCredential.id }
        }
      }

      return acc
    }, {}) // Default empty object for accumulator
  }, [submission, selectedCredId])

  useEffect(() => {}, [selectedCredentials])

  const { verifierName } = useMemo(() => {
    return { verifierName: credential?.verifierHostName }
  }, [credential])

  const handleAcceptTouched = async () => {
    try {
      if (!agent || !credential.credentialsForRequest || !selectedCredentials) {
        return
      }
      await shareProof({
        agent,
        authorizationRequest: credential.authorizationRequest,
        credentialsForRequest: credential.credentialsForRequest,
        selectedCredentials,
      })

      setAcceptModalVisible(true)
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(t('Error.Title1027'), t('Error.Message1027'), (err as Error)?.message ?? err, 1027)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleDeclineTouched = async () => {
    toggleDeclineModalVisible()
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  const renderHeader = () => {
    return (
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
          <Text style={TextTheme.title}>
            You have received an information request
            {verifierName ? ` from ${verifierName}` : ''}.
          </Text>
        </Text>
      </View>
    )
  }

  const onCredChange = (credId: string) => {
    setSelectedCredId(credId)
  }
  const handleAltCredChange = (
    selectedCred: {
      id: string
      credentialName: string
      issuerName?: string
      requestedAttributes?: string[]
      disclosedPayload?: Record<string, unknown>
      metadata?: CredentialMetadata
      backgroundColor?: string
      backgroundImage?: DisplayImage
      claimFormat: ClaimFormat | undefined | 'AnonCreds'
    }[],
    proofId: string,
  ) => {
    navigation.getParent()?.navigate(Stacks.ProofRequestsStack, {
      screen: Screens.ProofChangeCredentialOpenId4VP,
      params: {
        selectedCred,
        proofId,
        onCredChange,
      },
    })
  }
  const renderBody = () => {
    if (!submission) return null

    return (
      <View style={styles.credentialsList}>
        {submission.entries.map((credential, index) => {
          //TODO: Support multiple credentials
          const selectedCredential = credential.credentials[0]
          return (
            <View key={index}>
              <OpenIDCredentialRowCard
                name={credential.name}
                bgImage={selectedCredential.backgroundImage?.url}
                issuer={verifierName}
                onPress={() => {}}
              />
              {credential.isSatisfied && selectedCredential?.requestedAttributes ? (
                <View style={{ marginTop: 16, gap: 8 }}>
                  {credential.description && <Text style={TextTheme.labelSubtitle}>{credential.description}</Text>}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedCredential.requestedAttributes.map(attribute => (
                      <View key={attribute} style={{ flexBasis: '50%' }}>
                        <Text style={TextTheme.normal}>• {sanitizeString(attribute)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <Text style={TextTheme.title}>This credential is not present in your wallet.</Text>
              )}
              {credential.credentials.length > 1 && (
                <TouchableOpacity
                  onPress={() => {
                    handleAltCredChange(credential.credentials, credential.inputDescriptorId)
                  }}
                  testID={testIdWithKey('changeCredential')}
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 40 }}>
                  <Text style={styles.credActionText}>{t('ProofRequest.ChangeCredential')}</Text>
                  <Icon
                    style={{ ...styles.credActionText, fontSize: styles.credActionText.fontSize + 5 }}
                    name="chevron-right"
                  />
                </TouchableOpacity>
              )}
            </View>
          )
        })}
      </View>
    )
  }

  const footerButton = (
    title: string,
    buttonPress: () => void,
    buttonType: ButtonType,
    testID: string,
    accessibilityLabel: string,
  ) => {
    return (
      <View style={styles.footerButton}>
        <Button
          title={title}
          accessibilityLabel={accessibilityLabel}
          testID={testID}
          buttonType={buttonType}
          onPress={buttonPress}
          disabled={!buttonsVisible}
        />
      </View>
    )
  }

  const footer = () => {
    return (
      <View
        style={{
          paddingHorizontal: 25,
          paddingVertical: 16,
          paddingBottom: 26,
          backgroundColor: ColorPallet.brand.secondaryBackground,
        }}>
        {footerButton(
          t('Global.Share'),
          handleAcceptTouched,
          ButtonType.Primary,
          testIdWithKey('Share'),
          t('Global.Share'),
        )}
        {footerButton(
          t('Global.Decline'),
          toggleDeclineModalVisible,
          ButtonType.Secondary,
          testIdWithKey('DeclineCredentialOffer'),
          t('Global.Decline'),
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <View style={styles.pageContent}>
          {renderHeader()}
          {submission?.purpose && <Text style={TextTheme.labelSubtitle}>{submission.purpose}</Text>}
          {renderBody()}
        </View>
      </ScrollView>
      {footer()}

      <ProofRequestAccept visible={acceptModalVisible} proofId={''} confirmationOnly={true} />
      <CommonRemoveModal
        usage={ModalUsage.ProofRequestDecline}
        visible={declineModalVisible}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </SafeAreaView>
  )
}

export default OpenIDProofPresentation
