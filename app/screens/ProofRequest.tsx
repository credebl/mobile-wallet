/* eslint-disable no-console */
import type { StackScreenProps } from '@react-navigation/stack'

import {
  acceptProofRequest,
  AnonCredsCredentialsForProofRequest,
  AnonCredsRequestedAttributeMatch,
  AnonCredsRequestedPredicateMatch,
  CredentialExchangeRecord,
  declineProofRequest,
  deleteConnectionRecordById,
  getProofFormatData,
  sendProofProblemReport,
  useConnectionById,
  useProofById,
} from '@adeya/ssi'
import {
  useCentral,
  useCentralShutdownOnUnmount,
  useCloseTransportsOnUnmount,
} from '@animo-id/react-native-ble-didcomm'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { getProofDataForHistory } from '../../verifier/utils/proof'
import { saveHistory } from '../components/History/HistoryManager'
import { HistoryCardType, HistoryRecord } from '../components/History/types'
import Button, { ButtonType } from '../components/buttons/Button'
import { CredentialCard } from '../components/misc'
import ConnectionImage from '../components/misc/ConnectionImage'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import { EventTypes } from '../constants'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useConfiguration } from '../contexts/configuration'
import { useNetwork } from '../contexts/network'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useOutOfBandByConnectionId } from '../hooks/connections'
import { useAllCredentialsForProof } from '../hooks/proofs'
import { bleShareData } from '../services/bluetooth/ble-share-data'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens, Stacks, TabStacks } from '../types/navigators'
import { ProofCredentialAttributes, ProofCredentialItems, ProofCredentialPredicates } from '../types/proof-items'
import { Attribute, Predicate } from '../types/record'
import { ModalUsage } from '../types/remove'
import { useAppAgent } from '../utils/agent'
import { evaluatePredicates } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import ProofRequestAccept from './ProofRequestAccept'

type ProofRequestProps = StackScreenProps<NotificationStackParams, Screens.ProofRequest>
type Fields = Record<string, AnonCredsRequestedAttributeMatch[] | AnonCredsRequestedPredicateMatch[]>

interface CredentialListProps {
  header?: JSX.Element
  footer?: JSX.Element
  items: ProofCredentialItems[]
}

const ProofRequest: React.FC<ProofRequestProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  // eslint-disable-next-line no-unsafe-optional-chaining
  const { proofId: proofRecordId, serviceUuid } = route?.params
  const { agent } = useAppAgent()
  const { t } = useTranslation()
  const [proofId, setProofId] = useState<string>(proofRecordId)
  const { central } = useCentral()
  const { assertConnectedNetwork } = useNetwork()
  const proof = useProofById(proofId)
  const connection = proof?.connectionId ? useConnectionById(proof.connectionId) : undefined
  const proofConnectionLabel = connection?.theirLabel ?? proof?.connectionId ?? ''
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [revocationOffense, setRevocationOffense] = useState(false)
  const [retrievedCredentials, setRetrievedCredentials] = useState<AnonCredsCredentialsForProofRequest>()
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
  const [store] = useStore()

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
  })

  const onFailure = () => console.error('[CENTRAL]: failure')
  const onConnected = () => console.log('[CENTRAL]: connected')
  const onDisconnected = () => console.log('[CENTRAL]: disconnected')

  if (serviceUuid) {
    useCentralShutdownOnUnmount()
    useCloseTransportsOnUnmount(agent)
  }

  useEffect(() => {
    if (serviceUuid && !proofId) {
      bleShareData({
        onFailure,
        serviceUuid,
        central,
        agent,
        onConnected,
        onDisconnected,
      }).then(({ proofRecordId }) => {
        setProofId(proofRecordId)
      })
    }
  }, [serviceUuid, proofId])

  useEffect(() => {
    if (!agent) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1034'), t('Error.Message1034'), t('ProofRequest.ProofRequestNotFound'), 1034),
      )
    }
  }, [])

  const containsRevokedCreds = (
    credExRecords: CredentialExchangeRecord[],
    fields: {
      [key: string]: Attribute[] & Predicate[]
    },
  ) => {
    const revList = credExRecords.map(cred => {
      return {
        id: cred.credentials.map(item => item.credentialRecordId),
        revocationDate: cred.revocationNotification?.revocationDate,
      }
    })

    return revList.some(item => {
      const revDate = moment(item.revocationDate)
      return item.id.some(id => {
        return Object.keys(fields).some(key => {
          const dateIntervals = fields[key]
            ?.filter(attr => attr.credentialId === id)
            .map(attr => {
              return {
                to: attr.nonRevoked?.to !== undefined ? moment.unix(attr.nonRevoked.to) : undefined,
                from: attr.nonRevoked?.from !== undefined ? moment.unix(attr.nonRevoked.from) : undefined,
              }
            })
          return dateIntervals?.some(
            inter =>
              (inter.to !== undefined && inter.to > revDate) || (inter.from !== undefined && inter.from > revDate),
          )
        })
      })
    })
  }

  useEffect(() => {
    setLoading(true)
    credProofPromise
      ?.then(value => {
        if (value) {
          const { groupedProof, retrievedCredentials, fullCredentials } = value
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

          const formatCredentials = (
            retrievedItems: Record<string, (AnonCredsRequestedAttributeMatch | AnonCredsRequestedPredicateMatch)[]>,
            credList: string[],
          ) => {
            return Object.keys(retrievedItems)
              .map(key => {
                return {
                  [key]: retrievedItems[key].filter(attr => credList.includes(attr.credentialId)),
                }
              })
              .reduce((prev, curr) => {
                return {
                  ...prev,
                  ...curr,
                }
              }, {})
          }

          const selectRetrievedCredentials: AnonCredsCredentialsForProofRequest | undefined = retrievedCredentials
            ? {
                ...retrievedCredentials,
                attributes: formatCredentials(retrievedCredentials.attributes, credList) as Record<
                  string,
                  AnonCredsRequestedAttributeMatch[]
                >,
                predicates: formatCredentials(retrievedCredentials.predicates, credList) as Record<
                  string,
                  AnonCredsRequestedPredicateMatch[]
                >,
              }
            : undefined
          setRetrievedCredentials(selectRetrievedCredentials)

          const activeCreds = groupedProof.filter(item => credList.includes(item.credId))
          setActiveCreds(activeCreds)

          const unpackCredToField = (
            credentials: (ProofCredentialAttributes & ProofCredentialPredicates)[],
          ): { [key: string]: Attribute[] & Predicate[] } => {
            return credentials.reduce((prev, current) => {
              return { ...prev, [current.credId]: current.attributes ?? current.predicates ?? [] }
            }, {})
          }

          const records = fullCredentials.filter(record =>
            record.credentials.some(cred => credList.includes(cred.credentialRecordId)),
          )
          const foundRevocationOffense = containsRevokedCreds(records, unpackCredToField(activeCreds))
          setRevocationOffense(foundRevocationOffense)
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
  }, [proofId, selectedCredentials])

  const toggleDeclineModalVisible = () => {
    setDeclineModalVisible(!declineModalVisible)
  }

  const getCredentialsFields = (): Fields => ({
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

  const hasSatisfiedPredicates = (fields: Fields, credId?: string) =>
    activeCreds.flatMap(item => evaluatePredicates(fields, credId)(item)).every(p => p.satisfied)

  const formatCredentials = (
    retrievedItems: Record<string, (AnonCredsRequestedAttributeMatch | AnonCredsRequestedPredicateMatch)[]>,
    credList: string[],
  ) => {
    return Object.keys(retrievedItems)
      .map(key => {
        return {
          [key]: retrievedItems[key].find(cred => credList.includes(cred.credentialId)),
        }
      })
      .reduce((prev, current) => {
        return { ...prev, ...current }
      }, {})
  }

  const logHistoryRecord = useCallback(async () => {
    try {
      if (!(agent && store.preferences.useHistoryCapability)) {
        return
      }
      const type = HistoryCardType.ProofRequest
      if (!proof) {
        return
      }
      try {
        // Fetch proof data asynchronously
        const data = await getProofDataForHistory(agent, proofId)
        // Handle the case when data is not null or undefined
        if (data) {
          const requestName = proofConnectionLabel || data?.request?.indy?.name
          // Prepare the history record object
          const recordData: HistoryRecord = {
            type: type,
            message: type,
            createdAt: proof?.createdAt, // Assuming `data` has `createdAt` field
            correspondenceId: proofId,
            correspondenceName: requestName,
          }

          // Save the history record asynchronously
          await saveHistory(recordData, agent)
        }
      } catch (error) {
        // error when save history
      }
    } catch (err: unknown) {
      // error when agent and preferences not getting
    }
  }, [agent, store.preferences.useHistoryCapability, proof, proofId])

  const handleAcceptPress = async () => {
    try {
      if (!(agent && proof && assertConnectedNetwork())) {
        return
      }
      setPendingModalVisible(true)

      if (!retrievedCredentials) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      const format = await getProofFormatData(agent, proof.id)

      const formatToUse = format.request?.anoncreds ? 'anoncreds' : 'indy'

      const credObject = {
        ...retrievedCredentials,
        attributes: formatCredentials(
          retrievedCredentials.attributes,
          activeCreds.map(item => item.credId),
        ),
        predicates: formatCredentials(
          retrievedCredentials.predicates,
          activeCreds.map(item => item.credId),
        ),
        selfAttestedAttributes: {},
      }
      const automaticRequestedCreds = { proofFormats: { [formatToUse]: { ...credObject } } }

      if (!automaticRequestedCreds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      await acceptProofRequest(agent, {
        proofRecordId: proof.id,
        proofFormats: automaticRequestedCreds.proofFormats,
      })
      await logHistoryRecord()

      if (proof.connectionId && goalCode && goalCode.endsWith('verify.once')) {
        await deleteConnectionRecordById(agent, proof.connectionId)
      }
    } catch (err: unknown) {
      setPendingModalVisible(false)

      const error = new BifoldError(t('Error.Title1027'), t('Error.Message1027'), (err as Error).message, 1027)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleDeclineTouched = async () => {
    try {
      if (proof) {
        await declineProofRequest(agent, { proofRecordId: proof.id })

        // sending a problem report fails if there is neither a connectionId nor a ~service decorator
        if (proof.connectionId) {
          await sendProofProblemReport(agent, { proofRecordId: proof.id, description: t('ProofRequest.Declined') })
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

  const hasAvailableCredentials = useMemo(() => {
    const fields = getCredentialsFields()

    return !!retrievedCredentials && Object.values(fields).every(c => c.length > 0)
  }, [retrievedCredentials])

  const hasMatchingCredDef = useMemo(() => activeCreds.some(cred => cred.credDefId !== undefined), [activeCreds])

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
              {!hasSatisfiedPredicates(getCredentialsFields()) ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    style={{ marginLeft: -2, marginRight: 10 }}
                    name="highlight-off"
                    color={ListItems.proofIcon.color}
                    size={ListItems.proofIcon.fontSize}
                  />

                  <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                    {t('ProofRequest.YouDoNotHaveDataPredicate')}{' '}
                    <Text style={[TextTheme.title]}>{proofConnectionLabel || t('ContactDetails.AContact')}</Text>
                  </Text>
                </View>
              ) : (
                <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                  <Text style={[TextTheme.title]}>{proofConnectionLabel || t('ContactDetails.AContact')}</Text>{' '}
                  <Text>{t('ProofRequest.IsRequestingYouToShare')}</Text>
                  <Text style={[TextTheme.title]}>{` ${activeCreds?.length} `}</Text>
                  <Text>{activeCreds?.length > 1 ? t('ProofRequest.Credentials') : t('ProofRequest.Credential')}</Text>
                </Text>
              )}
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
      screen: Screens.ProofChangeCredential,
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
            disabled={!hasAvailableCredentials || !hasSatisfiedPredicates(getCredentialsFields()) || revocationOffense}
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
                    displayItems={[
                      ...(item.attributes ?? []),
                      ...evaluatePredicates(getCredentialsFields(), item.credId)(item),
                    ]}
                    credName={item.credName.substring(item.credName.lastIndexOf('/') + 1)}
                    existsInWallet={item.credDefId !== undefined}
                    satisfiedPredicates={hasSatisfiedPredicates(getCredentialsFields(), item.credId)}
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

  if (!proofId) {
    return (
      <View style={styles.cardLoading}>
        <RecordLoading />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.pageContainer} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <View style={styles.pageContent}>
          <CredentialList
            header={proofPageHeader()}
            footer={hasAvailableCredentials ? proofPageFooter() : undefined}
            items={activeCreds.filter(cred => cred.credDefId !== undefined) ?? []}
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
              items={activeCreds.filter(cred => cred.credDefId === undefined) ?? []}
            />
          )}
        </View>
        <ProofRequestAccept visible={pendingModalVisible} proofId={proofId} />
        <CommonRemoveModal
          usage={ModalUsage.ProofRequestDecline}
          visible={declineModalVisible}
          onSubmit={handleDeclineTouched}
          onCancel={toggleDeclineModalVisible}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProofRequest
