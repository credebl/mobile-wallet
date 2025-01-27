import { StackScreenProps } from '@react-navigation/stack'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import ScanButton from '../components/common/ScanButton'
import NotificationListItem, { NotificationType } from '../components/listItems/NotificationListItem'
import NoNewUpdates from '../components/misc/NoNewUpdates'
import { AttachTourStep } from '../components/tour/AttachTourStep'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { HomeStackParams, Screens } from '../types/navigators'

const { width } = Dimensions.get('window')
const offset = 25
const offsetPadding = 5

type HomeProps = StackScreenProps<HomeStackParams, Screens.Home>

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const { useCustomNotifications } = useConfiguration()
  const { notifications } = useCustomNotifications()
  const { t } = useTranslation()
  const { HomeTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingHorizontal: offset,
    },
    messageContainer: {
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      height: 250,
      width: 300,
    },
    header: {
      marginTop: offset,
      marginBottom: 20,
    },
    linkContainer: {
      minHeight: HomeTheme.link.fontSize,
      marginTop: 10,
    },
    link: {
      ...HomeTheme.link,
    },
    fabContainer: {
      position: 'absolute',
      bottom: 10,
      right: 10,
    },
    homeImage: {
      height: '85%',
      width: '80%',
    },
  })

  const DisplayListItemType = (item: any): ReactNode => {
    let component: ReactNode = <View style={{ backgroundColor: 'red', height: 30 }} />
    if (item.type === 'CredentialRecord') {
      let notificationType = NotificationType.CredentialOffer
      if (item.revocationNotification) {
        notificationType = NotificationType.Revocation
      }
      component = <NotificationListItem notificationType={notificationType} notification={item} />
    } else if (item.type === 'CustomNotification') {
      component = <NotificationListItem notificationType={NotificationType.Custom} notification={item} />
    } else {
      component = <NotificationListItem notificationType={NotificationType.ProofRequest} notification={item} />
    }
    return component
  }

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        {notifications?.length > 0 ? (
          <AttachTourStep index={1} fill>
            <Text style={[HomeTheme.notificationsHeader, styles.header]}>
              {t('Home.Notifications')}
              {notifications?.length ? ` (${notifications.length})` : ''}
            </Text>
          </AttachTourStep>
        ) : (
          <Text style={[HomeTheme.notificationsHeader, styles.header]}>
            {t('Home.Notifications')}
            {notifications?.length ? ` (${notifications.length})` : ''}
          </Text>
        )}
        {notifications?.length > 1 ? (
          <TouchableOpacity
            style={styles.linkContainer}
            activeOpacity={1}
            onPress={() => navigation.navigate(Screens.Notifications)}>
            <Text style={styles.link}>{t('Home.SeeAll')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={notifications?.length > 0 ? true : false}
        style={{ flexGrow: 0 }}
        snapToOffsets={[
          0,
          ...Array(notifications?.length)
            .fill(0)
            .map((n: number, i: number) => i * (width - 2 * (offset - offsetPadding)))
            .slice(1),
        ]}
        decelerationRate="fast"
        ListEmptyComponent={() => (
          <View style={{ marginHorizontal: offset, width: width - 2 * offset }}>
            <View>
              <NoNewUpdates />
            </View>
          </View>
        )}
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: width - 2 * offset,
              marginLeft: !index ? offset : offsetPadding,
              marginRight: index === notifications?.length - 1 ? offset : offsetPadding,
            }}>
            {DisplayListItemType(item)}
          </View>
        )}
      />
      <View style={styles.messageContainer}>
        <Image source={require('../assets/img/homeimage.png')} resizeMode="contain" style={styles.homeImage} />
      </View>
      <View style={styles.fabContainer}>
        <ScanButton />
      </View>
    </View>
  )
}

export default Home
