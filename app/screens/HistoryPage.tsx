import { useAdeyaAgent } from '@adeya/ssi'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'

import HistoryListItem from '../components/History/HistoryListItem'
import { getGenericRecordsByQuery } from '../components/History/HistoryManager'
import { CustomRecord, RecordType } from '../components/History/types'
import KeyboardView from '../components/views/KeyboardView'
import { useTheme } from '../contexts/theme'
import { HistoryStackParams } from '../types/navigators'

type HistoryPageProps = StackScreenProps<HistoryStackParams>

const HistoryPage: React.FC<HistoryPageProps> = () => {
  const [historyItems, setHistoryItems] = useState<CustomRecord[]>()
  const { t } = useTranslation()
  const { agent } = useAdeyaAgent()
  const { ColorPallet, TextTheme } = useTheme()
  const [loading, setLoading] = useState<boolean>(true)

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      paddingHorizontal: 20,
      paddingVertical: 5,
      justifyContent: 'space-between',
    },
    title: {
      marginTop: 16,
    },
    deleteButtonText: {
      alignSelf: 'flex-start',
      color: '#CD0000', //TODO: Use Bifold alert color
    },
    deleteButton: {
      marginBottom: 16,
    },
    gap: {
      marginTop: 10,
      marginBottom: 10,
    },
    // below used as helpful labels for views, no properties needed atp
    contentContainer: {},
    controlsContainer: {},
    loader: {
      justifyContent: 'center',
      flex: 1,
    },
  })

  //UI
  const renderEmptyListComponent = () => {
    return (
      <View style={{ alignContent: 'center', justifyContent: 'center', alignSelf: 'center' }}>
        <Text style={[style.title, TextTheme.normal]}>{!loading ? t('ActivityHistory.NoHistory') : ''}</Text>
      </View>
    )
  }

  const renderHistoryListItem = (item: CustomRecord) => {
    return <HistoryListItem item={item} />
  }
  const getHistory = async () => {
    const allRecords = await getGenericRecordsByQuery(agent, { type: RecordType.HistoryRecord })
    allRecords.sort((objA, objB) => {
      const dateA = objA.content.createdAt ? new Date(objA.content.createdAt).getTime() : 0
      const dateB = objB.content.createdAt ? new Date(objB.content.createdAt).getTime() : 0
      return dateB - dateA // Sort in descending order
    })

    if (allRecords) {
      setLoading(false)
      setHistoryItems(allRecords)
    }
  }
  useEffect(() => {
    getHistory()
  }, [])

  return (
    <KeyboardView>
      <View style={style.screenContainer}>
        {loading ? <ActivityIndicator style={style.loader} size={'large'} /> : null}
        <View style={style.contentContainer}>
          <View>
            <FlatList
              showsVerticalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              data={historyItems}
              ListEmptyComponent={renderEmptyListComponent}
              renderItem={element => renderHistoryListItem(element.item)}
            />
          </View>
        </View>
      </View>
    </KeyboardView>
  )
}

export default HistoryPage
