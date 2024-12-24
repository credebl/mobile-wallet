import { type Permission, PermissionsAndroid } from 'react-native'

const PERMISSIONS = [
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.BLUETOOTH_SCAN',
  'android.permission.BLUETOOTH_ADVERTISE',
  'android.permission.ACCESS_COARSE_LOCATION',
] as const as Permission[]

export const requestPermissions = async () => PermissionsAndroid.requestMultiple(PERMISSIONS)
