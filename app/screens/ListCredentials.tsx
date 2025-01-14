import {
  AnonCredsCredentialMetadataKey,
  CredentialExchangeRecord,
  CredentialState,
  GenericCredentialExchangeRecord,
  getAllW3cCredentialRecords,
  openId4VcCredentialMetadataKey,
  useConnections,
  useCredentialByState,
  W3cCredentialRecord,
} from '@adeya/ssi'
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
import { useConfiguration } from '../contexts/configuration'
import { CredentialStackParams, Screens } from '../types/navigators'
import { useAppAgent } from '../utils/agent'

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
    openIdState: { w3cCredentialRecords },
  } = useOpenIDCredentials()
  const credentials: GenericCredentialExchangeRecord[] = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
    ...w3cCredentialRecords,
  ]
  const [credentialList, setCredentialList] = useState<(CredentialExchangeRecord | EnhancedW3CRecord)[] | undefined>([])
  const { records: connectionRecords } = useConnections()

  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()

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
          const credentialRecordId = credential?.credentials[0].credentialRecordId
          try {
            const record = w3cCredentialRecords.find(record => record.id === credentialRecordId)
            if (!credential?.connectionId) {
              throw new Error('Connection Id notfound')
            }
            const connection = connectionRecords.find(connection => connection.id === credential?.connectionId)
            const enhancedRecord = record as EnhancedW3CRecord
            enhancedRecord.connectionLabel = connection?.theirLabel
            return enhancedRecord
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
  }, [credentialList])

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
        style={isHorizontal ? styles.credentialList : styles.credentialsCardList}
        data={credentialList?.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())}
        keyExtractor={credential => credential.id}
        renderItem={({ item: credential }) => {
          return (
            <View style={styles.renderView}>
              {credential instanceof CredentialExchangeRecord ? (
                <CredentialCard
                  credential={credential}
                  onPress={() =>
                    navigation.navigate(Screens.CredentialDetails, {
                      credential: credential as CredentialExchangeRecord,
                    })
                  }
                />
              ) : (
                <CredentialCard
                  schemaId={credential.credential.type[1]}
                  connectionLabel={credential.connectionLabel}
                  credential={credential}
                  onPress={() => {
                    if (!Object.keys(credential.metadata.data).includes(openId4VcCredentialMetadataKey)) {
                      navigation.navigate(Screens.CredentialDetailsW3C, { credential: credential })
                    } else {
                      navigation.navigate(Screens.OpenIDCredentialDetails, {
                        credential: credential,
                        screenMode: OpenIDCredScreenMode.details,
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
