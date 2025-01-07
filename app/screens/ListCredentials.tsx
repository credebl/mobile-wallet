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

import { useOpenIDCredentials } from '../components/Provider/OpenIDCredentialRecordProvider'
import ScanButton from '../components/common/ScanButton'
import CredentialCard from '../components/misc/CredentialCard'
import { OpenIDCredScreenMode } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { CredentialStackParams, Screens } from '../types/navigators'
import { useAppAgent } from '../utils/agent'

interface EnhancedW3CRecord extends W3cCredentialRecord {
  connectionLabel?: string
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  scanContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
})

const ListCredentials: React.FC = () => {
  const { t } = useTranslation()
  const { agent } = useAppAgent()
  const { credentialListOptions: CredentialListOptions, credentialEmptyList: CredentialEmptyList } = useConfiguration()
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
  const { ColorPallet } = useTheme()

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
  }, [credentials])

  return (
    <View style={styles.container}>
      <FlatList
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        data={credentialList?.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())}
        keyExtractor={credential => credential.id}
        renderItem={({ item: credential, index }) => {
          return (
            <View
              style={{
                marginHorizontal: 15,
                marginTop: 15,
                marginBottom: index === credentials.length - 1 ? 45 : 0,
              }}>
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
        ListEmptyComponent={() => <CredentialEmptyList message={t('Credentials.EmptyCredentailsList')} />}
      />
      <CredentialListOptions />
      <View style={styles.scanContainer}>
        <ScanButton />
      </View>
    </View>
  )
}

export default ListCredentials
