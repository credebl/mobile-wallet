import moment from 'moment'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

import { CustomRecord, HistoryCardType } from './types'

interface Props {
  item: CustomRecord
}

const styles = StyleSheet.create({
  mainCardView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  card: {
    padding: 10,
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
    // backgroundColor:'green'
  },
  cardContent: {
    flexDirection: 'column',
    marginHorizontal: 10,
    width: '80%',
  },
  cardDescriptionContent: {
    // marginTop: 5,
    // marginBottom: 10,
  },
  cardDate: {
    color: '#666666',
  },
  arrowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cardBottomBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#A0A4AB',
  },
  historyCardRevoked: {
    color: '#D81A21',
  },
  successColor: {
    color: '#118847',
  },
  infoBox: {
    color: '#1080A6',
  },
})

const HistoryListItem: React.FC<Props> = ({ item }) => {
  const { t } = useTranslation()
  const { TextTheme, Assets } = useTheme()
  //TODO: navigate to history details
  //   const navigation = useNavigation<StackNavigationProp<RootStackParams, 'HistoryDetails'>>()

  //TODO: render icon
  const renderCardIcon = (item: CustomRecord) => {
    switch (item.content.type) {
      case HistoryCardType.CardAccepted: {
        return <Assets.svg.historyCardAcceptedIcon />
      }
      case HistoryCardType.CardDeclined: {
        //TODO: return different icon
        return <Assets.svg.historyCardRevokedIcon />
      }
      case HistoryCardType.CardExpired: {
        return <Assets.svg.historyCardExpiredIcon />
      }
      case HistoryCardType.CardRevoked: {
        return <Assets.svg.historyCardRevokedIcon />
      }
      case HistoryCardType.InformationSent: {
        return <Assets.svg.historyInformationSentIcon />
      }
      case HistoryCardType.PinChanged: {
        return <Assets.svg.historyPinUpdatedIcon />
      }
      case HistoryCardType.ProofRequest: {
        return <Assets.svg.historyProofRequestIcon />
      }
      case HistoryCardType.Connection: {
        return <Assets.svg.historyNewConnectionIcon />
      }
      default:
        return null
    }
  }

  const renderCardTitle = (item: CustomRecord) => {
    switch (item.content.type) {
      case HistoryCardType.CardAccepted: {
        return (
          <Text style={TextTheme.caption}>
            {t('History.CardTitle.CardAccepted', { Credential: item.content.correspondenceName })}
          </Text>
        )
      }
      case HistoryCardType.CardDeclined: {
        return (
          <Text style={[TextTheme.labelTitle, { color: styles.historyCardRevoked.color }]}>
            {item.content.correspondenceName}
          </Text>
        )
      }
      case HistoryCardType.CardExpired: {
        return <Text style={TextTheme.labelTitle}>{item.content.correspondenceName}</Text>
      }
      case HistoryCardType.CardRevoked: {
        return (
          <Text style={[TextTheme.labelTitle, { color: styles.historyCardRevoked.color }]}>
            {item.content.correspondenceName}
          </Text>
        )
      }
      case HistoryCardType.InformationSent: {
        return (
          <Text style={[TextTheme.labelTitle, { color: styles.successColor.color }]}>
            {item.content.correspondenceName}
          </Text>
        )
      }
      case HistoryCardType.PinChanged: {
        return (
          <Text style={[TextTheme.labelTitle, { color: styles.infoBox.color }]}>{item.content.correspondenceName}</Text>
        )
      }
      case HistoryCardType.ProofRequest: {
        return (
          <Text style={TextTheme.caption}>
            {t('History.CardTitle.ProofRequest', { Credential: item.content.correspondenceName })}
          </Text>
        )
      }
      case HistoryCardType.Connection: {
        return (
          <Text style={TextTheme.caption}>
            {t('History.CardTitle.Connection', { Credential: item.content.connection })}
          </Text>
        )
      }
      default:
        return null
    }
  }
  // const renderCardDescription = (item: CustomRecord) => {
  //   console.log("🚀 ~ renderCardDescription ~ item:", item)
  //   switch (item.content.type) {
  //     case HistoryCardType.CardAccepted: {
  //       return <Text style={[TextTheme.labelTitle, { color: styles.infoBox.color }]}>{item.content.correspondenceName}</Text>
  //     }
  //     case HistoryCardType.CardDeclined: {
  //       return <Text style={[TextTheme.labelTitle, { color: styles.historyCardRevoked.color }]}>{item.content.correspondenceName}</Text>
  //     }
  //     case HistoryCardType.CardExpired: {
  //       return (
  //         <Text style={TextTheme.labelTitle}>
  //           {t('History.CardDescription.CardExpired', { cardName: item.content.correspondenceName })}
  //         </Text>
  //       )
  //     }
  //     case HistoryCardType.CardRevoked: {
  //       return (
  //         <Text style={[TextTheme.labelTitle, { color: styles.historyCardRevoked.color }]}>
  //           {t('History.CardDescription.CardRevoked', { cardName: item.content.correspondenceName })}
  //         </Text>
  //       )
  //     }
  //     case HistoryCardType.InformationSent: {
  //       return <Text style={[TextTheme.labelTitle, { color: styles.successColor.color }]}>{item.content.correspondenceName}</Text>
  //     }
  //     case HistoryCardType.PinChanged: {
  //       return <Text style={[TextTheme.labelTitle, { color: styles.infoBox.color }]}>{t('History.CardDescription.WalletPinUpdated')}</Text>
  //     }
  //     case HistoryCardType.ProofRequest: {
  //       return <Text style={[TextTheme.labelTitle, { color: styles.infoBox.color }]}>{item.content.correspondenceName}</Text>
  //     }
  //     case HistoryCardType.Connection: {
  //       return <Text style={[TextTheme.labelTitle, { color: styles.infoBox.color }]}>{item.content.connection}</Text>
  //     }
  //     default:
  //       return null
  //   }
  // }

  const renderCardDate = (date?: Date) => {
    if (!date) return null

    // const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    // const isDateToday = isToday(date)
    const dateFormate = moment(date).format('DD/MM/YYYY HH:mm:ss')
    return (
      <Text style={[TextTheme.caption, styles.cardDate]}>
        {/* {isDateToday ? t('History.Today') : date.toLocaleDateString('en-US', options)} */}
        {dateFormate}
      </Text>
    )
  }

  const renderCard = (item: CustomRecord) => {
    return (
      <View>
        <View style={styles.mainCardView}>
          <View style={styles.card}>{renderCardIcon(item)}</View>
          <View style={styles.cardContent}>
            {renderCardTitle(item)}
            {/* <View style={styles.cardDescriptionContent}>{renderCardDescription(item)}</View> */}
            {renderCardDate(item.content.createdAt)}
          </View>
          <View style={styles.arrowContainer}>{/* <Assets.svg.iconChevronRight /> */}</View>
        </View>
        <View style={styles.cardBottomBorder} />
      </View>
    )
  }

  return (
    <TouchableOpacity
      onPress={() => {
        //TODO: navigate to history details
      }}>
      {renderCard(item)}
    </TouchableOpacity>
  )
}

export default HistoryListItem
