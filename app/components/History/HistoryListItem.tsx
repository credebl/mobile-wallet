import moment from 'moment'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

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
    height: 40,
    width: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'column',
    marginLeft: 20,
    width: '80%',
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

  //TODO: render icon
  const renderCardIcon = (item: CustomRecord) => {
    switch (item.content.type) {
      case HistoryCardType.CardAccepted: {
        return <Assets.svg.historyCardAcceptedIcon />
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

  const formatDate = (dateString: Date) => {
    const now = moment() // Current date and time
    const date = moment(dateString) // Message date and time
    const diffDays = now.diff(date, 'days')

    switch (diffDays) {
      case 0:
        // If it's today, show "x minutes/hours ago"
        return moment(dateString).fromNow()
      case 1:
        // If it's yesterday, show "Yesterday"
        return 'Yesterday'
      case 2:
        // For messages up to 2 days old, show the full date (e.g., "Oct 10, 2024")
        return moment(date).format('MMM D, YYYY')
      default:
        // For older messages, show the full date
        return moment(date).fromNow()
    }
  }
  const renderCardDate = (date?: Date) => {
    if (!date) return null

    return <Text style={[TextTheme.caption, styles.cardDate]}>{formatDate(date)}</Text>
  }

  const renderCard = (item: CustomRecord) => {
    return (
      <View>
        <View style={styles.mainCardView}>
          <View style={styles.card}>{renderCardIcon(item)}</View>
          <View style={styles.cardContent}>
            {renderCardTitle(item)}
            {renderCardDate(item.content.createdAt)}
          </View>
          <View style={styles.arrowContainer}></View>
        </View>
        <View style={styles.cardBottomBorder} />
      </View>
    )
  }

  return <View>{renderCard(item)}</View>
}

export default HistoryListItem
