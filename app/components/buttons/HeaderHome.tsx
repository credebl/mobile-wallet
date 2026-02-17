import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Screens, Stacks, TabStacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

import HeaderButton, { ButtonLocation } from './HeaderButton'

const HeaderRightHome: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  return (
    <HeaderButton
      buttonLocation={ButtonLocation.Right}
      accessibilityLabel={t('Global.Home')}
      testID={testIdWithKey('HomeButton')}
      onPress={() =>
        navigation
          .getParent()
          ?.navigate(Stacks.TabStack, { screen: TabStacks.HomeStack, params: { screen: Screens.Home } })
      }
      icon="home"
    />
  )
}

export default HeaderRightHome
