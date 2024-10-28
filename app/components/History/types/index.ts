import { Moment } from 'moment'

export interface IHistoryManager {
  saveHistory: (recordData: HistoryRecord) => void
  getHistoryItems: (query: HistoryQuery) => Promise<CustomRecord[]>
  handleStoreHistorySettings: (selectedValue: HistoryBlockSelection | undefined) => Promise<void>
  getStoredHistorySettingsOption: () => Promise<string | null>
  getHistorySettingsOptionList: () => Array<HistoryBlockSelection>
}

export interface HistoryBlockSelection {
  value: string
  id: string
  key?: number
  date?: Moment
}

export enum HistoryCardType {
  CardAccepted = 'Credential Accepted',
  CardDeclined = 'CardDeclined',
  CardExpired = 'CardExpired',
  CardRevoked = 'CardRevoked',
  InformationSent = 'InformationSent',
  PinChanged = 'PinChanged',
  CardUpdates = 'CardUpdates',
  ProofRequest = 'ProofRequest',
  Connection = 'Connection',
}
export interface HistoryRecord {
  /** History Record ID */
  id?: string
  /** History Record Type */
  type?: HistoryCardType
  /** History Record Message */
  message: string
  /** History Record Date */
  createdAt?: Date
  /** History Record Item ID */
  correspondenceId?: string
  /** History Record Item Name */
  correspondenceName?: string
  /** History connection Record */
  connection?: string
}
export enum RecordType {
  HistoryRecord = 'HistoryRecord',
}
export type TagObject = {
  [key: string]: string | boolean | undefined | Array<string> | null
  [key: number]: never
}

export interface CustomRecord {
  content: RecordTypes
  tags?: TagObject
}

type RecordTypes = HistoryRecord
export type HistoryQuery = {
  type: RecordType
}
