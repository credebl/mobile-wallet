import { Agent } from '@adeya/ssi'
// eslint-disable-next-line import/no-extraneous-dependencies
import { GenericRecordTags } from '@credo-ts/core/build/modules/generic-records/repository/GenericRecord'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { LocalStorageKeys } from '../../constants'

import { CustomRecord, HistoryBlockSelection, HistoryRecord, RecordType } from './types'

// Add Generic Record
export async function addGenericRecord(
  agent: Agent<any> | null,
  customRecord: CustomRecord,
  type: RecordType,
): Promise<void> {
  //   const { agent } = useAppAgent()
  try {
    if (!agent) {
      return
    }
    const tags = { type }
    const storedContent = customRecord.content as Record<string, unknown>
    await agent.genericRecords.save({ content: storedContent, tags })
  } catch (e: unknown) {
    throw new Error(`${e}`)
  }
}

// Get Generic Records by Query
export async function getGenericRecordsByQuery(
  agent: Agent<any> | null,
  query: Partial<GenericRecordTags>,
): Promise<CustomRecord[]> {
  try {
    if (!agent) {
      throw new Error(`Agent not set`)
    }
    const savedRecords = await agent.genericRecords.findAllByQuery(query)
    const retrievedRecords: CustomRecord[] = savedRecords.map(element => {
      const tags = element.getTags()
      switch (tags.type) {
        case RecordType.HistoryRecord:
          return { content: element.content as unknown as HistoryRecord, tags }
        default:
          return { content: {}, tags }
      }
    })
    return retrievedRecords
  } catch (e: unknown) {
    throw new Error(`${e}`)
  }
}

// Save History Record
export async function saveHistory(recordData: HistoryRecord, agent: Agent<any> | null) {
  try {
    const historySettingsOption = await AsyncStorage.getItem(LocalStorageKeys.HistorySettingsOption)
    if (historySettingsOption !== 'Never') {
      await addGenericRecord(agent, { content: recordData }, RecordType.HistoryRecord)
    }
  } catch (e: unknown) {
    throw new Error(`${e}`)
  }
}

// Handle Store History Settings
export async function handleStoreHistorySettings(selectedValue: HistoryBlockSelection | undefined): Promise<void> {
  if (!selectedValue) {
    throw new Error('No option selected')
  }
  await AsyncStorage.setItem(LocalStorageKeys.HistorySettingsOption, selectedValue.id)
}

// Get Stored History Settings Option
export async function getStoredHistorySettingsOption(): Promise<string | null> {
  return (await AsyncStorage.getItem(LocalStorageKeys.HistorySettingsOption)) ?? null
}

// Get History Settings Option List
export function getHistorySettingsOptionList(): Array<HistoryBlockSelection> {
  const oneMonth = moment().subtract(1, 'month')
  const sixMonth = moment().subtract(6, 'month')
  const oneYear = moment().subtract(1, 'year')
  const { i18n } = useTranslation()

  return [
    { key: 0, id: '1 month', date: oneMonth, value: i18n.t('ActivityHistory.DeleteActivityAfter.1month') },
    { key: 1, id: '6 month', date: sixMonth, value: i18n.t('ActivityHistory.DeleteActivityAfter.6month') },
    { key: 2, id: '1 year', date: oneYear, value: i18n.t('ActivityHistory.DeleteActivityAfter.1year') },
    { key: 3, id: 'Always', value: i18n.t('ActivityHistory.DeleteActivityAfter.Always') },
  ]
}
