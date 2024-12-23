import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { CredentialCard } from '../components/misc'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ProofChangeProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofChangeCredentialOpenId4VP>

const OpenID4VCProofChangeCredential: React.FC<ProofChangeProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('Change credential route params were not set properly')
  }
  const { selectedCred, onCredChange } = route.params

  const { ColorPallet, TextTheme } = useTheme()
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
    },
    pageMargin: {
      marginHorizontal: 20,
    },
    cardLoading: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
      flex: 1,
      flexGrow: 1,
      marginVertical: 35,
      borderRadius: 15,
      paddingHorizontal: 10,
    },
    selectedCred: {
      borderWidth: 5,
      borderRadius: 15,
      borderColor: ColorPallet.semantic.focus,
    },
  })

  const listHeader = () => {
    return (
      <View style={{ ...styles.pageMargin, marginVertical: 20 }}>
        <Text style={TextTheme.normal}>{t('ProofRequest.MultipleCredentials')}</Text>
      </View>
    )
  }

  const changeCred = (credId: string) => {
    onCredChange(credId)
    navigation.goBack()
  }

  const renderCredential = ({ item }: { item: any }) => {
    const displayItems = [
      { label: 'Issuer', value: item?.issuerName },
      ...Object.entries(item?.disclosedPayload || {}).map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize key
        value: value?.toString() ?? '',
      })),
    ]

    return (
      <View style={styles.pageMargin}>
        <View
          testID={testIdWithKey(`select:${item?.id}`)}
          style={[item?.id === selectedCred ? styles.selectedCred : {}, { marginBottom: 10 }]}>
          <CredentialCard
            credential={item?.credExchangeRecord}
            credDefId={item?.credDefId}
            schemaId={item?.schemaId}
            displayItems={displayItems}
            credName={item?.credentialName}
            existsInWallet={true}
            satisfiedPredicates={true}
            proof={true}
            onPress={() => {
              changeCred(item?.id)
            }}
          />
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.pageContainer} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={selectedCred}
        ListHeaderComponent={listHeader}
        renderItem={renderCredential}
        keyExtractor={item => item?.id ?? ''}
      />
    </SafeAreaView>
  )
}

export default OpenID4VCProofChangeCredential
