import React, { PropsWithChildren, forwardRef, useState } from 'react'
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native'

import { useTheme } from '../../contexts/theme'

export enum ButtonType {
  Critical,
  Primary,
  Secondary,
  ModalCritical,
  ModalPrimary,
  ModalSecondary,
  style,
}

export interface ButtonProps {
  title: string
  buttonType: ButtonType
  accessibilityLabel?: string
  testID?: string
  onPress?: () => void
  disabled?: boolean
  style?: ViewStyle
}

const Button: React.FC<PropsWithChildren<ButtonProps & React.RefAttributes<TouchableOpacity>>> = forwardRef(
  (
    { title, buttonType, accessibilityLabel, testID, onPress, disabled = false, children, style },
    ref: React.LegacyRef<TouchableOpacity>,
  ) => {
    const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false
    const { Buttons, heavyOpacity } = useTheme()
    const buttonStyles = {
      [ButtonType.Critical]: { color: Buttons.critical, text: Buttons.primaryText },
      [ButtonType.Primary]: { color: Buttons.primary, text: Buttons.primaryText },
      [ButtonType.Secondary]: { color: Buttons.secondary, text: Buttons.secondaryText },
      [ButtonType.ModalCritical]: { color: Buttons.modalCritical, text: Buttons.primaryText },
      [ButtonType.ModalPrimary]: { color: Buttons.modalPrimary, text: Buttons.modalPrimaryText },
      [ButtonType.ModalSecondary]: { color: Buttons.modalSecondary, text: Buttons.modalSecondaryText },
    }
    const [isActive, setIsActive] = useState<boolean>(false)

    return (
      <TouchableOpacity
        onPress={onPress}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={'button'}
        onPressIn={() => setIsActive(!disabled && true)}
        onPressOut={() => setIsActive(false)}
        testID={testID}
        style={[
          buttonStyles[buttonType].color,
          disabled && (buttonType === ButtonType.Primary ? Buttons.primaryDisabled : Buttons.secondaryDisabled),
          isActive && buttonType === ButtonType.Secondary && { backgroundColor: Buttons.primary.backgroundColor },
          accessibilityLabel === 'Yes' ? { width: 100 } : null,
          style,
        ]}
        disabled={disabled}
        activeOpacity={heavyOpacity}
        ref={ref}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {children}
          <Text
            style={[
              buttonStyles[buttonType].text,
              disabled &&
                (buttonType === ButtonType.Primary ? Buttons.primaryTextDisabled : Buttons.secondaryTextDisabled),
              isActive && { textDecorationLine: 'underline' },
              isActive && buttonType === ButtonType.Secondary && { color: Buttons.primaryText.color },
            ]}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  },
)

export default Button
