import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { RootStackParams, Screens } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'
import HeaderButton, { ButtonLocation } from '../buttons/HeaderButton'

const HistoryMenu: React.FC<{ type?: boolean; notificationCount?: number }> = ({
  type = false,
  notificationCount = 0,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { t } = useTranslation()

  return (
    <HeaderButton
      buttonLocation={ButtonLocation.Right}
      accessibilityLabel={t('Screens.Settings')}
      testID={testIdWithKey('Settings')}
      onPress={() => navigation.navigate(Screens.Notifications)}
      icon={'bell'}
      badgeShow={type}
      notificationCount={notificationCount}
    />
  )
}

export default HistoryMenu
