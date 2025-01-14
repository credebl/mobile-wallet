import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'

const defaultIconSize = 26

export enum ButtonLocation {
  Left,
  Right,
}

interface HeaderButtonProps {
  buttonLocation: ButtonLocation
  accessibilityLabel: string
  testID: string
  onPress: () => void
  icon: string
  text?: string
  badgeShow?: boolean
  notificationCount?: number
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  buttonLocation,
  icon,
  text,
  accessibilityLabel,
  testID,
  onPress,
  badgeShow,
  notificationCount,
}) => {
  const { ColorPallet, TextTheme } = useTheme()
  const style = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: buttonLocation === ButtonLocation.Left ? 0 : 15,
      marginLeft: buttonLocation === ButtonLocation.Right ? 0 : 15,
      minWidth: defaultIconSize,
      minHeight: defaultIconSize,
    },
    title: {
      ...TextTheme.label,
      color: ColorPallet.brand.headerText,
      marginRight: 4,
    },
    badge: {
      position: 'absolute',
      right: -5, // Adjust to position the badge on the top-right corner
      top: -5, // Adjust to position the badge on the top-right corner
      backgroundColor: 'red',
      borderRadius: 10, // Makes the badge circular
      width: 18, // Adjust size based on the badge
      height: 18, // Adjust size based on the badge
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
  })

  const layoutForButtonLocation = (buttonLocation: ButtonLocation) => {
    switch (buttonLocation) {
      case ButtonLocation.Left:
        return (
          <>
            <Icon name={icon} size={defaultIconSize} color={ColorPallet.brand.headerIcon} />
            {text && <Text style={[style.title]}>{text}</Text>}
          </>
        )
      case ButtonLocation.Right:
        return (
          <>
            {text && <Text style={[style.title]}>{text}</Text>}
            <Icon name={icon} size={defaultIconSize} color={ColorPallet.brand.headerIcon} />
            {badgeShow && notificationCount > 0 && (
              <View style={style.badge}>
                <Text style={style.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </>
        )
    }
  }
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={'button'}
      testID={testID}
      onPress={onPress}
      hitSlop={hitSlop}>
      <View style={style.container}>{layoutForButtonLocation(buttonLocation)}</View>
    </TouchableOpacity>
  )
}

export default HeaderButton
