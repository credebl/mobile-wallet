import AsyncStorage from '@react-native-async-storage/async-storage'
import Clipboard from '@react-native-clipboard/clipboard'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Switch,
} from 'react-native'
import { getVersion, getBuildNumber } from 'react-native-device-info'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { ToastType } from '../components/toast/BaseToast'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Locales } from '../localization'
import { GenericFn } from '../types/fn'
import { Screens, SettingStackParams, Stacks } from '../types/navigators'
import { SettingSection } from '../types/settings'
import * as PushNotificationHelper from '../utils/PushNotificationHelper'
import { useAppAgent } from '../utils/agent'
import { getDefaultHolderDidDocument } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type SettingsProps = StackScreenProps<SettingStackParams>

const touchCountToEnableBiometrics = 9

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const [store, dispatch] = useStore()
  const { agent } = useAppAgent()
  const developerOptionCount = useRef(0)
  const { SettingsTheme, TextTheme, ColorPallet, Assets } = useTheme()
  const { settings, enableTours } = useConfiguration()
  const [enablePushNotifications, setEnablePushNotifications] = useState(false)
  const [pushNotificationCapable, setPushNotificationCapable] = useState(true)
  const [holderDid, setHolderDid] = useState('')
  const { isGoogleAccountSignedIn, googleSignOut } = useAuth()

  const languages = [{ id: Locales.en, value: t('Language.English') }]

  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      width: '100%',
    },
    section: {
      backgroundColor: SettingsTheme.groupBackground,
      paddingVertical: 15,
      flexGrow: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 0,
      marginBottom: -11,
    },
    sectionSeparator: {
      marginBottom: 10,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexGrow: 1,
      paddingHorizontal: 30,
    },
    itemSeparator: {
      borderBottomWidth: 1,
      borderBottomColor: ColorPallet.brand.primaryBackground,
      marginHorizontal: 25,
    },
    logo: {
      height: 64,
      width: '50%',
      marginVertical: 16,
    },
    footer: {
      marginVertical: 25,
      alignItems: 'center',
    },
  })
  const getPushNotificationCapable = async () => {
    if (!agent) return
    if ((await AsyncStorage.getItem('MEDIATOR_NOTIFICATION_SUPPORT')) === 'true') setPushNotificationCapable(true)
    else setPushNotificationCapable(false)
  }

  const initializePushNotificationsToggle = async () => {
    setEnablePushNotifications(await PushNotificationHelper.isEnabled())
  }
  const toggleDevPushNotificationsSwitch = async () => {
    if (!pushNotificationCapable || !agent) return
    await PushNotificationHelper.setDeviceInfo(agent, enablePushNotifications)
    setEnablePushNotifications(!enablePushNotifications)
  }

  useEffect(() => {
    if (agent) {
      getPushNotificationCapable()
      initializePushNotificationsToggle()
      getDefaultHolderDidDocument(agent).then(didDoc => {
        setHolderDid(didDoc?.id)
      })
    }
  }, [agent])

  const currentLanguage = languages.find(l => l.id === i18n.language)?.value

  const incrementDeveloperMenuCounter = () => {
    if (developerOptionCount.current >= touchCountToEnableBiometrics) {
      developerOptionCount.current = 0
      dispatch({
        type: DispatchAction.ENABLE_DEVELOPER_MODE,
        payload: [true],
      })

      return
    }

    developerOptionCount.current = developerOptionCount.current + 1
  }

  const copyToClipboard = () => {
    Clipboard.setString(holderDid)
    Toast.hide()
    Toast.show({
      type: ToastType.Success,
      text1: 'DID copied',
    })
  }

  const settingsSections: SettingSection[] = [
    {
      header: {
        icon: 'settings',
        title: t('Screens.WalletName'),
      },
      data: [
        {
          title: store.preferences.walletName,
          accessibilityLabel: t('Screens.NameWallet'),
          testID: testIdWithKey('NameWallet'),
          onPress: () => navigation.navigate(Screens.NameWallet as never),
          value: 'Edit',
        },
      ],
    },
    {
      header: {
        icon: 'settings',
        title: t('DIDs.Dids'),
      },
      data: [
        {
          title: holderDid,
          accessibilityLabel: t('DIDs.Dids'),
          testID: testIdWithKey('DID'),
          onPress: copyToClipboard,
          value: 'Copy',
        },
      ],
    },
    {
      header: {
        icon: 'apartment',
        title: t('Screens.Contacts'),
      },
      data: [
        {
          title: t('Screens.Contacts'),
          accessibilityLabel: t('Screens.Contacts'),
          testID: testIdWithKey('Contacts'),
          onPress: () =>
            navigation
              .getParent()
              ?.navigate(Stacks.ContactStack, { screen: Screens.Contacts, params: { navigation: navigation } }),
        },
        {
          title: t('WhatAreContacts.Title'),
          accessibilityLabel: t('Settings.WhatAreContacts'),
          testID: testIdWithKey('WhatAreContacts'),
          onPress: () => navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.WhatAreContacts }),
          value: undefined,
        },
      ],
    },
    {
      header: {
        icon: 'settings',
        title: 'Security',
      },
      data: [
        {
          title: t('Backup.backup_wallet'),
          accessibilityLabel: t('Settings.Backup'),
          testID: testIdWithKey('Biometrics'),
          onPress: () => navigation.navigate(Screens.ExportWallet as never),
          value: undefined,
        },
        {
          title: t('Backup.backup_google_drive'),
          accessibilityLabel: t('Settings.GoogleDriveBackup'),
          testID: testIdWithKey('BackupGoogleDrive'),
          onPress: async () => {
            if (isGoogleAccountSignedIn) {
              navigation.navigate(Screens.ExportWallet, { backupType: 'google_drive' })
            } else {
              navigation.navigate(Screens.GoogleDriveSignIn as never)
            }
          },
          value: undefined,
        },
        isGoogleAccountSignedIn && {
          title: t('GoogleDrive.SignOutGoogle'),
          accessibilityLabel: t('GoogleDrive.SignOutGoogle'),
          testID: testIdWithKey('SignOutGoogleAccount'),
          onPress: async () => {
            await googleSignOut()
            navigation.navigate(Screens.Settings)
          },
          value: undefined,
        },
      ].filter(Boolean),
    },

    {
      header: {
        icon: 'settings',
        title: t('Settings.AppSettings'),
      },
      data: [
        {
          title: t('Global.Biometrics'),
          value: store.preferences.useBiometry ? t('Global.On') : t('Global.Off'),
          accessibilityLabel: t('Global.Biometrics'),
          testID: testIdWithKey('Biometrics'),
          onPress: () => navigation.navigate(Screens.UseBiometry),
        },
        {
          title: t('Settings.Language'),
          value: currentLanguage,
          accessibilityLabel: t('Settings.Language'),
          testID: testIdWithKey('Language'),
          onPress: () => navigation.navigate(Screens.Language),
        },
        {
          title:
            t('PushNotifications.PushNotifications') +
            (pushNotificationCapable ? '' : t('PushNotifications.NotAvailable')),
          value: (
            <Switch
              trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
              thumbColor={enablePushNotifications ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
              ios_backgroundColor={ColorPallet.grayscale.lightGrey}
              onValueChange={toggleDevPushNotificationsSwitch}
              value={enablePushNotifications}
            />
          ),
          accessibilityLabel:
            t('PushNotifications.PushNotifications') +
            (pushNotificationCapable ? '' : t('PushNotifications.NotAvailable')),
          testID: testIdWithKey('PushNotificationsSwitch'),
          onPress: () => {},
        },
      ],
    },
    {
      header: {
        title: t('Settings.MoreInformation'),
        icon: 'info',
      },
      data: [
        {
          title: t('Settings.TermsOfUse'),
          accessibilityLabel: t('Settings.TermsOfUse'),
          testID: testIdWithKey('TermsOfUse'),
          onPress: () => navigation.getParent()?.navigate(Stacks.SettingStack, { screen: Screens.Terms }),
          value: undefined,
        },
        {
          title: t('Settings.IntroductionToTheApp'),
          accessibilityLabel: t('Settings.IntroductionToTheApp'),
          testID: testIdWithKey('IntroductionToTheApp'),
          onPress: () => navigation.getParent()?.navigate(Stacks.SettingStack, { screen: Screens.Onboarding }),
          value: undefined,
        },
      ],
    },

    ...(settings || []),
  ]

  if (enableTours && store.preferences.developerModeEnabled) {
    const section = settingsSections.find(item => item.header.title === t('Settings.AppSettings'))
    if (section) {
      section.data = [
        ...section.data,
        {
          title: t('Settings.AppGuides'),
          value: store.tours.enableTours ? t('Global.On') : t('Global.Off'),
          accessibilityLabel: t('Settings.AppGuides'),
          testID: testIdWithKey('AppGuides'),
          onPress: () => navigation.navigate(Screens.Tours),
        },
      ]
    }
  }

  if (store.preferences.developerModeEnabled) {
    const section = settingsSections.find(item => item.header.title === t('Settings.AppSettings'))
    if (section) {
      section.data = [
        ...section.data,
        {
          title: t('Settings.Developer'),
          accessibilityLabel: t('Settings.Developer'),
          testID: testIdWithKey('DeveloperOptions'),
          onPress: () => navigation.navigate(Screens.Developer),
        },
      ]
    }
  }

  // if (store.preferences.useVerifierCapability) {
  settingsSections.splice(1, 0, {
    header: {
      icon: 'send',
      title: t('Screens.ProofRequests'),
    },
    data: [
      {
        title: t('Screens.SendProofRequest'),
        accessibilityLabel: t('Screens.ProofRequests'),
        testID: testIdWithKey('ProofRequests'),
        onPress: () =>
          navigation.getParent()?.navigate(Stacks.ProofRequestsStack, {
            screen: Screens.ProofVerificationType,
            // screen: Screens.ProofRequests,
            // params: { navigation: navigation },
          }),
      },
    ],
  })

  const section = settingsSections.find(item => item.header.title === t('Settings.AppSettings'))
  if (section) {
    section.data.splice(3, 0, {
      title: t('Settings.DataRetention'),
      value: store.preferences.useDataRetention ? t('Global.On') : t('Global.Off'),
      accessibilityLabel: t('Settings.DataRetention'),
      testID: testIdWithKey('DataRetention'),
      onPress: () => navigation.navigate(Screens.DataRetention),
    })
  }
  // }

  if (store.preferences.useConnectionInviterCapability) {
    settingsSections.splice(2, 0, {
      header: {
        icon: 'send',
        title: t('Screens.ConnectionInvitation'),
      },
      data: [
        {
          title: t('Screens.CreateConnectionInvitation'),
          accessibilityLabel: t('Screens.CreateConnectionInvitation'),
          testID: testIdWithKey('CreateConnectionInvitation'),
          onPress: () =>
            navigation.getParent()?.navigate(Stacks.ContactStack, {
              screen: Screens.ConnectionInvitation,
              params: { navigation: navigation },
            }),
        },
      ],
    })
  }

  if (store.preferences.useConnectionInviterCapability) {
    const section = settingsSections.find(item => item.header.title === t('Screens.Contacts'))
    if (section) {
      section.data.splice(1, 0, {
        title: t('Settings.ScanMyQR'),
        accessibilityLabel: t('Settings.ScanMyQR'),
        testID: testIdWithKey('ScanMyQR'),
        onPress: () =>
          navigation.getParent()?.navigate(Stacks.ConnectStack, {
            screen: Screens.Scan,
            params: { defaultToConnect: true },
          }),
      })
    }
  }

  const SectionHeader: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
    <View style={[styles.section, styles.sectionHeader]}>
      <Icon accessible={false} name={icon} size={24} style={{ marginRight: 10, color: SettingsTheme.iconColor }} />
      <Text accessibilityRole={'header'} style={[TextTheme.headingThree, { flexShrink: 1 }]}>
        {title}
      </Text>
    </View>
  )

  const SectionRow: React.FC<{
    title: string
    value?: string
    accessibilityLabel?: string
    testID?: string
    onPress?: GenericFn
  }> = ({ title, value, accessibilityLabel, testID, onPress }) => (
    <ScrollView keyboardShouldPersistTaps="handled" style={styles.section} contentContainerStyle={{ flexGrow: 1 }}>
      <TouchableOpacity
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={styles.sectionRow}
        onPress={onPress}>
        <Text
          style={[TextTheme.headingFour, { fontWeight: 'normal', marginRight: 14, width: '80%' }]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {title}
        </Text>
        <Text style={[TextTheme.headingFour, { fontWeight: 'normal', color: ColorPallet.brand.link }]}>{value}</Text>
      </TouchableOpacity>
    </ScrollView>
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <SectionList
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: { title, value, accessibilityLabel, testID, onPress } }) => (
          <SectionRow
            title={title}
            accessibilityLabel={accessibilityLabel}
            testID={testID ?? 'NoTestIdFound'}
            value={value}
            onPress={onPress}
          />
        )}
        renderSectionHeader={({
          section: {
            header: { title, icon },
          },
        }) => <SectionHeader icon={icon} title={title} />}
        ItemSeparatorComponent={() => (
          <View style={{ backgroundColor: SettingsTheme.groupBackground }}>
            <View style={[styles.itemSeparator]}></View>
          </View>
        )}
        SectionSeparatorComponent={() => <View style={[styles.sectionSeparator]}></View>}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <TouchableWithoutFeedback
              onPress={incrementDeveloperMenuCounter}
              disabled={store.preferences.developerModeEnabled}>
              <View>
                <Text style={TextTheme.normal} testID={testIdWithKey('Version')}>
                  {`${t('Settings.Version')} ${getVersion()} ${t('Settings.Build')} (${getBuildNumber()})`}
                </Text>
                <Assets.svg.logo {...styles.logo} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        )}
        sections={settingsSections}
        stickySectionHeadersEnabled={false}></SectionList>
    </SafeAreaView>
  )
}

export default Settings
