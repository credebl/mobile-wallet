import type { StackScreenProps } from '@react-navigation/stack'

import {
  acceptProofRequest,
  declineProofRequest,
  deleteConnectionRecordById,
  DifPresentationExchangeProofFormatService,
  GetCredentialsForRequestReturn,
  sendProofProblemReport,
  useConnectionById,
  useProofById,
  utils,
} from '@adeya/ssi'
// eslint-disable-next-line import/no-extraneous-dependencies
import { DifPexCredentialsForRequestRequirement, SubmissionEntryCredential } from '@credo-ts/core'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Button, { ButtonType } from '../components/buttons/Button'
import { CredentialCard } from '../components/misc'
import ConnectionImage from '../components/misc/ConnectionImage'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import { CREDENTIAL, EventTypes } from '../constants'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useConfiguration } from '../contexts/configuration'
import { useNetwork } from '../contexts/network'
import { useTheme } from '../contexts/theme'
import { useOutOfBandByConnectionId } from '../hooks/connections'
import { useAllCredentialsForProof } from '../hooks/proofs'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens, Stacks, TabStacks } from '../types/navigators'
import { ProofCredentialItems } from '../types/proof-items'
import { ModalUsage } from '../types/remove'
import { useAppAgent } from '../utils/agent'
import { testIdWithKey } from '../utils/testable'

import ProofRequestAccept from './ProofRequestAccept'

type ProofRequestProps = StackScreenProps<NotificationStackParams, Screens.ProofRequestW3C>

interface CredentialListProps {
  header?: JSX.Element
  footer?: JSX.Element
  items: ProofCredentialItems[]
}

const ProofRequestW3C: React.FC<ProofRequestProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  // eslint-disable-next-line no-unsafe-optional-chaining
  const { proofId } = route?.params
  const { agent } = useAppAgent()
  const { t } = useTranslation()
  const { assertConnectedNetwork } = useNetwork()
  const proof = useProofById(proofId)
  const connection = proof?.connectionId ? useConnectionById(proof.connectionId) : undefined
  const proofConnectionLabel = connection?.theirLabel ?? proof?.connectionId ?? ''
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [retrievedCredentials, setRetrievedCredentials] = useState<{
    attributes: Record<string, SubmissionEntryCredential[]>
    predicates: Record<string, SubmissionEntryCredential[]>
  }>()
  const [loading, setLoading] = useState<boolean>(true)
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const { ColorPallet, ListItems, TextTheme } = useTheme()
  const { RecordLoading } = useAnimatedComponents()
  const goalCode = useOutOfBandByConnectionId(agent, proof?.connectionId ?? '')?.outOfBandInvitation.goalCode
  const { OCABundleResolver } = useConfiguration()
  const [containsPI, setContainsPI] = useState(false)
  const [activeCreds, setActiveCreds] = useState<ProofCredentialItems[]>([])
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([])
  const credProofPromise = useAllCredentialsForProof(proofId)

  const hasMatchingCredDef = useMemo(
    () => activeCreds.some(cred => cred.credExchangeRecord !== undefined),
    [activeCreds],
  )
  const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
    },
    pageContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    pageMargin: {
      marginHorizontal: 20,
    },
    pageFooter: {
      marginBottom: 15,
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
    link: {
      ...ListItems.recordAttributeText,
      ...ListItems.recordLink,
      paddingVertical: 2,
    },
    valueContainer: {
      minHeight: ListItems.recordAttributeText.fontSize,
      paddingVertical: 4,
    },
    detailsButton: {
      ...ListItems.recordAttributeText,
      color: ColorPallet.brand.link,
      textDecorationLine: 'underline',
    },
    cardLoading: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
      flex: 1,
      flexGrow: 1,
      marginVertical: 35,
      borderRadius: 15,
      paddingHorizontal: 10,
    },
    input: {
      textAlign: 'center',
      borderBottomColor: ColorPallet.grayscale.black,
      borderBottomWidth: 1,
    },
  })

  useEffect(() => {
    if (!agent && !proof) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1034'), t('Error.Message1034'), t('ProofRequest.ProofRequestNotFound'), 1034),
      )
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    credProofPromise
      ?.then(value => {
        if (value) {
          const { groupedProof, retrievedCredentials } = value
          const retrievedCreds = retrievedCredentials as GetCredentialsForRequestReturn<
            [DifPresentationExchangeProofFormatService]
          >['proofFormats']['presentationExchange']
          setLoading(false)
          let credList: string[] = []
          if (selectedCredentials.length > 0) {
            credList = selectedCredentials
          } else {
            // we only want one of each satisfying credential
            groupedProof.forEach(item => {
              const credId = item.altCredentials?.[0]
              if (credId && !credList.includes(credId)) {
                credList.push(credId)
              }
            })
          }

          const formatCredentials = (retrievedItems: DifPexCredentialsForRequestRequirement[], credList: string[]) => {
            return retrievedItems
              .map(item => {
                return {
                  [item.submissionEntry[0].inputDescriptorId]: item.submissionEntry[0].verifiableCredentials.filter(
                    cred => credList.includes(cred.credentialRecord.id),
                  ),
                }
              })
              .reduce((prev, curr) => {
                return {
                  ...prev,
                  ...curr,
                }
              }, {})
          }

          const selectRetrievedCredentials = retrievedCreds
            ? {
                attributes: formatCredentials(retrievedCreds.requirements, credList),
                predicates: {},
              }
            : undefined

          setRetrievedCredentials(selectRetrievedCredentials)

          const activeCreds = groupedProof.filter(item => credList.includes(item.credId))
          setActiveCreds(activeCreds)
        }
      })
      .catch((err: unknown) => {
        const error = new BifoldError(
          t('Error.Title1026'),
          t('Error.Message1026'),
          (err as Error)?.message ?? err,
          1026,
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      })
  }, [selectedCredentials])

  const toggleDeclineModalVisible = () => {
    setDeclineModalVisible(!declineModalVisible)
  }

  const getCredentialsFields = () => ({
    ...retrievedCredentials?.attributes,
    ...retrievedCredentials?.predicates,
  })

  useEffect(() => {
    // get oca bundle to see if we're presenting personally identifiable elements
    activeCreds.some(async item => {
      if (!item || !(item.credDefId || item.schemaId)) {
        return false
      }
      const labels = (item.attributes ?? []).map(field => field.label ?? field.name ?? '')
      const bundle = await OCABundleResolver.resolveAllBundles({
        identifiers: { credentialDefinitionId: item.credDefId, schemaId: item.schemaId },
      })
      const flaggedAttributes: string[] = (bundle as any).bundle.bundle.flaggedAttributes.map((attr: any) => attr.name)
      const foundPI = labels.some(label => flaggedAttributes.includes(label))
      setContainsPI(foundPI)
      return foundPI
    })
  }, [activeCreds])

  const hasAvailableCredentials = useMemo(() => {
    const fields = getCredentialsFields()

    return !!retrievedCredentials && Object.values(fields).every(c => c.length > 0)
  }, [retrievedCredentials])

  const handleAcceptPress = async () => {
    try {
      if (!(agent && proof && assertConnectedNetwork())) {
        return
      }
      setPendingModalVisible(true)

      if (!retrievedCredentials) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      const proofCreds = { ...retrievedCredentials?.attributes }

      Object.keys(proofCreds).forEach(key => {
        proofCreds[key] = [proofCreds[key][0].credentialRecord]
      })

      const proofFormats = {
        presentationExchange: {
          credentials: proofCreds,
        },
      }

      if (!proofFormats) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      await acceptProofRequest(agent, {
        proofRecordId: proof.id,
        proofFormats,
      })
      if (proof.connectionId && goalCode && goalCode.endsWith('verify.once')) {
        await deleteConnectionRecordById(agent, proof.connectionId)
      }
    } catch (err: unknown) {
      setPendingModalVisible(false)

      const error = new BifoldError(t('Error.Title1027'), t('Error.Message1027'), (err as Error).message, 1027)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleDeclineTouched = async (reason: string | undefined) => {
    try {
      if (proof) {
        await declineProofRequest(agent, { proofRecordId: proof.id })

        // sending a problem report fails if there is neither a connectionId nor a ~service decorator
        if (proof.connectionId) {
          await sendProofProblemReport(agent, {
            proofRecordId: proof.id,
            description: reason ? reason : t('ProofRequest.Declined'),
          })
          if (goalCode && goalCode.endsWith('verify.once')) {
            await deleteConnectionRecordById(agent, proof.connectionId)
          }
        }
      }
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1028'), t('Error.Message1028'), (err as Error).message, 1028)

      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }

    toggleDeclineModalVisible()

    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  const proofPageHeader = () => {
    return (
      <View style={styles.pageMargin}>
        {loading ? (
          <View style={styles.cardLoading}>
            <RecordLoading />
          </View>
        ) : (
          <>
            <ConnectionImage connectionId={proof?.connectionId} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                <Text style={[TextTheme.title]}>{proofConnectionLabel || t('ContactDetails.AContact')}</Text>{' '}
                <Text>{t('ProofRequest.IsRequestingYouToShare')}</Text>
                <Text style={[TextTheme.title]}>{` ${activeCreds?.length} `}</Text>
                <Text>{activeCreds?.length > 1 ? t('ProofRequest.Credentials') : t('ProofRequest.Credential')}</Text>
              </Text>
              {containsPI && (
                <View
                  style={{
                    backgroundColor: ColorPallet.notification.warn,
                    width: '100%',
                    marginTop: 10,
                    borderColor: ColorPallet.notification.warnBorder,
                    borderWidth: 2,
                    borderRadius: 4,
                    flexDirection: 'row',
                  }}>
                  <Icon
                    style={{ marginTop: 15, marginLeft: 10 }}
                    name="warning"
                    color={ColorPallet.notification.warnIcon}
                    size={TextTheme.title.fontSize + 5}
                  />
                  <Text
                    style={{
                      ...TextTheme.title,
                      color: ColorPallet.notification.warnText,
                      flex: 1,
                      flexWrap: 'wrap',
                      margin: 10,
                    }}>
                    {t('ProofRequest.SensitiveInformation')}
                  </Text>
                </View>
              )}
            </View>
            {!hasAvailableCredentials && hasMatchingCredDef && (
              <Text
                style={{
                  ...TextTheme.title,
                }}>
                {t('ProofRequest.FromYourWallet')}
              </Text>
            )}
          </>
        )}
      </View>
    )
  }

  const handleAltCredChange = (selectedCred: string, altCredentials: string[]) => {
    const onCredChange = (cred: string) => {
      const newSelectedCreds = (
        selectedCredentials.length > 0 ? selectedCredentials : activeCreds.map(item => item.credId)
      ).filter(id => !altCredentials.includes(id))
      setSelectedCredentials([cred, ...newSelectedCreds])
    }
    navigation.getParent()?.navigate(Stacks.ProofRequestsStack, {
      screen: Screens.ProofChangeCredentialW3C,
      params: {
        selectedCred,
        altCredentials,
        proofId,
        onCredChange,
      },
    })
  }

  const proofPageFooter = () => {
    return (
      <View style={[styles.pageFooter, styles.pageMargin]}>
        {!loading && proofConnectionLabel && goalCode !== 'aries.vc.verify.once' ? null : null}
        <View style={styles.footerButton}>
          <Button
            title={t('Global.Share')}
            accessibilityLabel={t('Global.Share')}
            testID={testIdWithKey('Share')}
            buttonType={ButtonType.Primary}
            onPress={handleAcceptPress}
            disabled={!hasAvailableCredentials}
          />
        </View>
        <View style={styles.footerButton}>
          <Button
            title={t('Global.Decline')}
            accessibilityLabel={t('Global.Decline')}
            testID={testIdWithKey('Decline')}
            buttonType={!retrievedCredentials ? ButtonType.Primary : ButtonType.Secondary}
            onPress={toggleDeclineModalVisible}
          />
        </View>
      </View>
    )
  }

  const CredentialList = ({ header, footer, items }: CredentialListProps) => {
    return (
      <FlatList
        data={items}
        scrollEnabled={false}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        renderItem={({ item }) => {
          return (
            <View>
              {loading ? null : (
                <View style={{ marginTop: 10, marginHorizontal: 20 }}>
                  <CredentialCard
                    credential={item.credExchangeRecord}
                    credDefId={item.credDefId}
                    schemaId={item.schemaId}
                    displayItems={[...(item.attributes ?? [])]}
                    credName={
                      utils.isValidUuid(item.credName)
                        ? CREDENTIAL
                        : item.credName.substring(item.credName.lastIndexOf('/') + 1)
                    }
                    existsInWallet={item?.inputDescriptorIds}
                    satisfiedPredicates={item.credId !== undefined}
                    hasAltCredentials={item.altCredentials && item.altCredentials.length > 1}
                    handleAltCredChange={
                      item.altCredentials && item.altCredentials.length > 1
                        ? () => {
                            handleAltCredChange(item.credId, item.altCredentials ?? [item.credId])
                          }
                        : undefined
                    }
                    proof={true}></CredentialCard>
                </View>
              )}
            </View>
          )
        }}
      />
    )
  }

  return (
    <SafeAreaView style={styles.pageContainer} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <View style={styles.pageContent}>
          <CredentialList
            header={proofPageHeader()}
            footer={hasAvailableCredentials ? proofPageFooter() : undefined}
            items={activeCreds.filter(cred => cred.credExchangeRecord === undefined)?.length > 0 ? [] : activeCreds}
          />
          {!hasAvailableCredentials && (
            <CredentialList
              header={
                <View style={styles.pageMargin}>
                  {!loading && (
                    <>
                      {hasMatchingCredDef && (
                        <View
                          style={{
                            width: 'auto',
                            borderWidth: 1,
                            borderColor: ColorPallet.grayscale.lightGrey,
                            marginTop: 20,
                          }}
                        />
                      )}
                      <Text
                        style={{
                          ...TextTheme.title,
                          marginTop: 10,
                        }}>
                        {t('ProofRequest.MissingCredentials')}
                      </Text>
                    </>
                  )}
                </View>
              }
              footer={proofPageFooter()}
              items={activeCreds.filter(cred => cred.credExchangeRecord === undefined) ?? []}
            />
          )}
        </View>
        <ProofRequestAccept visible={pendingModalVisible} proofId={proofId} />
        <CommonRemoveModal
          usage={ModalUsage.ProofRequestDecline}
          visible={declineModalVisible}
          onSubmit={(reason: string | undefined) => {
            handleDeclineTouched(reason)
          }}
          onCancel={toggleDeclineModalVisible}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProofRequestW3C
