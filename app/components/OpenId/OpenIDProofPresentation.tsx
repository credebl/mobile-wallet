import { ClaimFormat } from '@credebl/ssi-mobile-didcomm'
import { CredentialMetadata, DisplayImage, FormattedSubmissionEntrySatisfied } from '@credebl/ssi-mobile-openid4vc'
import { MaterialIcons } from '@react-native-vector-icons/material-icons'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventTypes } from '../../constants'
import { useTheme } from '../../contexts/theme'
import ProofRequestAccept from '../../screens/ProofRequestAccept'
import { ListItems } from '../../theme'
import { BifoldError } from '../../types/error'
import { NotificationStackParams, Screens, Stacks, TabStacks } from '../../types/navigators'
import { W3CCredentialAttributeField } from '../../types/record'
import { ModalUsage } from '../../types/remove'
import { useSdk } from '../../utils/agent'
import { formatCredentialSubject } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import CommonRemoveModal from '../modals/CommonRemoveModal'
import W3CCredentialRecord from '../record/W3CCredentialRecord'

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
  const [selectedCredentials, setSelectedCredentials] = useState<{ [inputDescriptorId: string]: string }>({})

  const { ColorPallet, TextTheme } = useTheme()
  const { t } = useTranslation()
  const { sdk } = useSdk()

  const satisfiedEntries = credential?.formattedSubmission.entries.filter(
    (e): e is FormattedSubmissionEntrySatisfied => e.isSatisfied,
  )
  const toggleDeclineModalVisible = () => setDeclineModalVisible(!declineModalVisible)

  const submission = useMemo(() => {
    const submission = credential?.formattedSubmission
    return submission
  }, [credential])

  useEffect(() => {
    if (submission?.areAllSatisfied) {
      const preSelected: { [inputDescriptorId: string]: string } = {}

      submission.entries?.forEach((entry: any) => {
        if (entry.inputDescriptorId && entry.credentials && entry.credentials.length > 0) {
          const firstCredential = entry.credentials[0]?.credential
          if (firstCredential?.id) {
            const cleanCredentialId = firstCredential.id.replace(/^(w3c-credential-|sd-jwt-vc-|mdoc-)/, '')
            preSelected[entry.inputDescriptorId] = cleanCredentialId
          }
        }
      })
      setSelectedCredentials(preSelected)
    }
  }, [submission])

  const verifierName = useMemo(() => {
    return credential?.verifier?.name || credential?.verifier?.hostName || 'Unknown Verifier'
  }, [credential])

  const handleAcceptTouched = async () => {
    try {
      if (!sdk) {
        return
      }

      setButtonsVisible(false)

      await sdk.modules.openid.shareProof({
        resolvedRequest: credential,
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
    navigation.getParent()?.navigate(Stacks.TabStack, { screen: TabStacks.HomeStack, params: { screen: Screens.Home } })
  }

  const handleAltCredChange = (
    credentials: {
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
    inputDescriptorId: string,
  ) => {
    const onCredChange = (credId: string) => {
      const cleanCredentialId = credId.replace(/^(w3c-credential-|sd-jwt-vc-|mdoc-)/, '')
      setSelectedCredentials(prev => ({
        ...prev,
        [inputDescriptorId]: cleanCredentialId,
      }))
    }

    const currentSelectedId =
      selectedCredentials[inputDescriptorId] || credentials[0]?.id?.replace(/^(w3c-credential-|sd-jwt-vc-|mdoc-)/, '')

    navigation.getParent()?.navigate(Stacks.ProofRequestsStack, {
      screen: Screens.ProofChangeCredentialOpenId4VP,
      params: {
        selectedCred: currentSelectedId,
        altCredentials: credentials,
        onCredChange,
      },
    })
  }

  const renderHeader = () => {
    return (
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
          <Text style={TextTheme.title}>You have received an information request from {verifierName}.</Text>
        </Text>
      </View>
    )
  }

  const renderBody = () => {
    if (!satisfiedEntries) return null

    return (
      <View style={styles.credentialsList}>
        {submission.entries?.map((entry: any, index: number) => {
          if (!entry.credentials || entry.credentials.length === 0) {
            return (
              <View key={entry.inputDescriptorId || index}>
                <Text style={TextTheme.title}>This credential is not present in your wallet.</Text>
              </View>
            )
          }

          const selectedCredId = selectedCredentials[entry.inputDescriptorId]
          const selectedCred =
            entry.credentials.find((c: any) => {
              const cleanId = c.credential?.id?.replace(/^(sd-jwt-vc-|mdoc-)/, '')
              return cleanId === selectedCredId
            }) || entry.credentials[0]

          const credentialData = selectedCred?.credential

          const disclosedData = selectedCred?.disclosed

          const attributesToDisplay = disclosedData?.attributes || credentialData?.rawAttributes || {}

          const formattedAttributes = formatCredentialSubject(attributesToDisplay)

          const initializeExpandState = (attrs: W3CCredentialAttributeField[]): W3CCredentialAttributeField[] => {
            return attrs
              .filter(attr => {
                const attrKey = attr.key || ''
                return !(
                  attrKey?.includes('age_over_18') ||
                  attrKey?.includes('age_over_60') ||
                  attrKey?.includes('Age Over 18') ||
                  attrKey?.includes('Age Over 60')
                )
              })
              .map(attr => {
                const newAttr = { ...attr, isExpanded: attr.level === 0 }
                if (newAttr.children && newAttr.children.length > 0) {
                  newAttr.children = initializeExpandState(newAttr.children)
                }
                return newAttr
              })
          }

          const tables = initializeExpandState(formattedAttributes)

          const header = () => {
            return (
              <View style={{ marginHorizontal: 15 }}>
                <OpenIDCredentialRowCard
                  name={credentialData?.display?.name || credentialData?.metadata?.type || 'Credential'}
                  bgImage={credentialData?.display?.backgroundImage?.url}
                  onPress={() => {}}
                  txtColor={credentialData?.display.textColor}
                  issuerLogo={credentialData?.display?.issuer?.logo?.url}
                />
                {entry.credentials.length > 1 && (
                  <TouchableOpacity
                    onPress={() => {
                      handleAltCredChange(entry.credentials, entry.inputDescriptorId)
                    }}
                    testID={testIdWithKey('changeCredential')}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                    <Text style={styles.credActionText}>{t('ProofRequest.ChangeCredential')}</Text>
                    <MaterialIcons
                      style={{ ...styles.credActionText, fontSize: styles.credActionText.fontSize + 5 }}
                      name="chevron-right"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )
          }

          return (
            <View key={entry.inputDescriptorId || index}>
              <W3CCredentialRecord
                tables={tables}
                fields={[]}
                hideFieldValues={false}
                header={header}
                footer={() => null}
              />
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
      <View style={{ flex: 1, paddingHorizontal: 5 }}>
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
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 26,
          backgroundColor: ColorPallet.brand.secondaryBackground,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {footerButton(
          t('Global.Decline'),
          toggleDeclineModalVisible,
          ButtonType.Secondary,
          testIdWithKey('DeclineCredentialOffer'),
          t('Global.Decline'),
        )}
        {footerButton(
          t('Global.Share'),
          handleAcceptTouched,
          ButtonType.Primary,
          testIdWithKey('Share'),
          t('Global.Share'),
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1, flex: 1 }} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <View style={styles.pageContent}>
          {renderHeader()}
          {satisfiedEntries?.purpose && <Text style={TextTheme.labelSubtitle}>{satisfiedEntries.purpose}</Text>}
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
