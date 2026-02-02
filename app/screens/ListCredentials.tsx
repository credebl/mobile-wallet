import {
  AnonCredsCredentialMetadataKey,
  CredentialExchangeRecord,
  CredentialState,
  GenericCredentialExchangeRecord,
  getAllW3cCredentialRecords,
  openId4VcCredentialMetadataKey,
  W3cCredentialRecord,
  SdJwtVcRecord,
} from '@adeya/ssi'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MdocRecord } from '@credo-ts/core'
import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'

import { useOpenIDCredentials } from '../components/Provider/OpenIDCredentialRecordProvider'
import ScanButton from '../components/common/ScanButton'
import CredentialCard from '../components/misc/CredentialCard'
import { OpenIDCredScreenMode } from '../constants'
import { useConnections, useCredentialByState } from '../contexts/agent'
import { useConfiguration } from '../contexts/configuration'
import { CredentialStackParams, Screens } from '../types/navigators'
import { useAppAgent } from '../utils/agent'
import { getCredentialFormat } from '../utils/helpers'

interface EnhancedW3CRecord extends W3cCredentialRecord {
  connectionLabel?: string
}

interface Props {
  isHorizontal?: boolean
}

const ListCredentials: React.FC<Props> = ({ isHorizontal = false }) => {
  const { t } = useTranslation()
  const { agent } = useAppAgent()
  const { credentialEmptyList: CredentialEmptyList } = useConfiguration()
  const {
    openIdState: { w3cCredentialRecords, sdJwtVcRecords, mdocRecords },
  } = useOpenIDCredentials()
  const credentials: (GenericCredentialExchangeRecord | W3cCredentialRecord | SdJwtVcRecord | MdocRecord)[] = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
    ...w3cCredentialRecords,
    ...(sdJwtVcRecords ?? []),
    ...(mdocRecords ?? []),
  ]
  const [credentialList, setCredentialList] = useState<
    (CredentialExchangeRecord | EnhancedW3CRecord | SdJwtVcRecord | MdocRecord)[]
  >([])
  const { records: connectionRecords } = useConnections()

  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()

  const getSchemaId = (credential: any): string => {
    if (credential instanceof W3cCredentialRecord) {
      try {
        const credentialData = credential.credential?.credential || credential.credential
        if (credentialData?.type && Array.isArray(credentialData.type)) {
          return credentialData.type[1] || credentialData.type[0] || ''
        }
      } catch (e) {
        // Fallback
      }
    }
    return ''
  }

  useEffect(() => {
    const updateCredentials = async () => {
      if (!agent) {
        return
      }

      const w3cCredentialRecords = await getAllW3cCredentialRecords(agent)

      const updatedCredentials = credentials.map(credential => {
        if (
          !Object.keys(credential.metadata.data).includes(openId4VcCredentialMetadataKey) &&
          !Object.keys(credential.metadata.data).includes(AnonCredsCredentialMetadataKey)
        ) {
          const credentialRecordId = credential?.credentials[0]?.credentialRecordId
          try {
            const record = w3cCredentialRecords.find(record => record.id === credentialRecordId)
            if (credential?.connectionId) {
              const connection = connectionRecords.find(connection => connection.id === credential?.connectionId)
              const enhancedRecord = record as EnhancedW3CRecord
              enhancedRecord.connectionLabel = connection?.theirLabel
              return enhancedRecord
            }
          } catch (e: unknown) {
            throw new Error(`${e}`)
          }
        }
        return credential
      })
      return updatedCredentials
    }

    updateCredentials().then(updatedCredentials => {
      setCredentialList(updatedCredentials)
    })
  }, [agent, w3cCredentialRecords, sdJwtVcRecords, mdocRecords, connectionRecords])

  const styles = StyleSheet.create({
    container: { flex: 1, marginHorizontal: 10 },
    credentialList: { width: wp('100%'), height: wp('40%') },
    credentialsCardList: {},
    renderView: {
      marginRight: isHorizontal ? 20 : 0,
      marginTop: 15,
      width: isHorizontal ? wp('85%') : 'auto',
    },
    fabContainer: {
      position: 'absolute',
      bottom: 10,
      right: 10,
    },
  })

  return (
    <View style={styles.container}>
      <FlatList
        horizontal={isHorizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={isHorizontal ? styles.credentialList : styles.credentialsCardList}
        data={credentialList?.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())}
        keyExtractor={credential => credential.id}
        renderItem={({ item: credential }) => {
          const format = getCredentialFormat(credential)
          const schemaId = getSchemaId(credential)
          const connectionLabel = (credential as any)?.connectionLabel || ''

          return (
            <View style={styles.renderView}>
              {credential instanceof CredentialExchangeRecord ? (
                <CredentialCard
                  credential={credential}
                  credentialFormat={format}
                  onPress={() =>
                    navigation.navigate(Screens.CredentialDetails, {
                      credential: credential as CredentialExchangeRecord,
                    })
                  }
                />
              ) : (
                <CredentialCard
                  credential={credential}
                  credentialFormat={format}
                  schemaId={schemaId}
                  connectionLabel={connectionLabel}
                  onPress={() => {
                    if (credential instanceof SdJwtVcRecord || credential instanceof MdocRecord) {
                      navigation.navigate(Screens.OpenIDCredentialDetails, {
                        credential: credential,
                        screenMode: OpenIDCredScreenMode.details,
                      })
                    } else if (credential instanceof W3cCredentialRecord) {
                      navigation.navigate(Screens.CredentialDetailsW3C, {
                        credential: credential,
                      })
                    }
                  }}
                />
              )}
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={isHorizontal ? styles.credentialList : styles.credentialsCardList}>
            <CredentialEmptyList message={t('Credentials.EmptyCredentailsList')} />
          </View>
        }
      />
      {!isHorizontal && (
        <View style={styles.fabContainer}>
          <ScanButton />
        </View>
      )}
    </View>
  )
}

export default ListCredentials
