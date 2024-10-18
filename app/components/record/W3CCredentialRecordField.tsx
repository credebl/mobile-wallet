import startCase from 'lodash.startcase'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { hiddenFieldValue } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { W3CCredentialAttribute } from '../../types/record'
import { testIdWithKey } from '../../utils/testable'

interface W3CCredentialRecordFieldProps {
  field: W3CCredentialAttribute
  hideFieldValue?: boolean
  hideBottomBorder?: boolean
  shown?: boolean
  onToggleViewPressed?: () => void
}

export const validEncoding = 'base64'
export const validFormat = new RegExp('^image/(jpeg|png|jpg)')

interface AttributeValueParams {
  field: W3CCredentialAttribute
  shown?: boolean
  style?: Record<string, unknown>
}

export const AttributeValue: React.FC<AttributeValueParams> = ({ field, style, shown }) => {
  const { ListItems } = useTheme()
  const styles = StyleSheet.create({
    text: {
      ...ListItems.recordAttributeText,
    },
  })

  return (
    <Text style={style || styles.text} testID={testIdWithKey('AttributeValue')}>
      {shown ? field.value : hiddenFieldValue}
    </Text>
  )
}

const W3CCredentialRecordField: React.FC<W3CCredentialRecordFieldProps> = ({
  field,
  hideFieldValue = false,
  hideBottomBorder = false,
  shown = !hideFieldValue,
  onToggleViewPressed = () => undefined,
}) => {
  const { t } = useTranslation()
  const { ListItems } = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...ListItems.recordContainer,
      paddingHorizontal: 25,
      paddingTop: 16,
    },
    border: {
      ...ListItems.recordBorder,
      borderBottomWidth: 2,
      paddingTop: 12,
    },
    link: {
      ...ListItems.recordLink,
      paddingVertical: 2,
    },
    valueContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 10,
    },
    valueText: {
      ...ListItems.recordAttributeText,
      paddingVertical: 4,
      width: '90%',
    },
  })

  return (
    <View style={styles.container}>
      <Text style={[ListItems.recordAttributeLabel, { fontWeight: 'bold' }]} testID={testIdWithKey('AttributeName')}>
        {field.key ?? startCase(field.key || '')}
      </Text>
      <View style={styles.valueContainer}>
        <>
          <View style={styles.valueText}>
            <AttributeValue field={field} shown={shown} />
          </View>
          {hideFieldValue ? (
            <TouchableOpacity
              accessible={true}
              accessibilityLabel={shown ? t('Record.Hide') : t('Record.Show')}
              testID={testIdWithKey('ShowHide')}
              activeOpacity={1}
              onPress={onToggleViewPressed}
              style={styles.link}>
              <Text style={ListItems.recordLink}>{shown ? t('Record.Hide') : t('Record.Show')}</Text>
            </TouchableOpacity>
          ) : null}
        </>
      </View>
      <View style={[styles.border, hideBottomBorder && { borderBottomWidth: 0 }]} />
    </View>
  )
}

export default W3CCredentialRecordField
