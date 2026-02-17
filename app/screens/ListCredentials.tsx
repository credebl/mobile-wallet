import { MdocRecord } from '@credebl/ssi-mobile-core'
import {
  AnonCredsCredentialMetadataKey,
  DidCommCredentialExchangeRecord,
  DidCommCredentialState,
  W3cCredentialRecord,
  SdJwtVcRecord,
  useCredentialByState,
  useConnections,
} from '@credebl/ssi-mobile-didcomm'
import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, View } from 'react-native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'

import ScanButton from '../components/common/ScanButton'
import CredentialCard from '../components/misc/CredentialCard'
import { OpenIDCredScreenMode } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { CredentialStackParams, Screens } from '../types/navigators'
import { useSdk } from '../utils/agent'
import { getCredentialFormat } from '../utils/helpers'

const openId4VcCredentialMetadataKey = '_credebl/openId4VcCredentialMetadata'

interface EnhancedW3CRecord extends W3cCredentialRecord {
  connectionLabel?: string
}

interface Props {
  isHorizontal?: boolean
}

const ListCredentials: React.FC<Props> = ({ isHorizontal = false }) => {
  const { t } = useTranslation()
  const { sdk } = useSdk()
  const { credentialEmptyList: CredentialEmptyList } = useConfiguration()
  const credentials: (DidCommCredentialExchangeRecord | W3cCredentialRecord | SdJwtVcRecord | MdocRecord)[] = [
    ...useCredentialByState(DidCommCredentialState.CredentialReceived),
    ...useCredentialByState(DidCommCredentialState.Done),
  ]
  const [credentialList, setCredentialList] = useState<
    (DidCommCredentialExchangeRecord | EnhancedW3CRecord | SdJwtVcRecord | MdocRecord)[]
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
      if (!sdk) {
        return
      }

      const w3cCredentialRecords = await sdk.agent.w3cCredentials.getAll()

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
  }, [sdk, connectionRecords])

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
              {credential instanceof DidCommCredentialExchangeRecord ? (
                <CredentialCard
                  credential={credential}
                  credentialFormat={format}
                  onPress={() =>
                    navigation.navigate(Screens.CredentialDetails, {
                      credential: credential as DidCommCredentialExchangeRecord,
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
