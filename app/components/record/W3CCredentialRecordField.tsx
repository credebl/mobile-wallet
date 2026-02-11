import { sanitizeString } from '@credebl/ssi-mobile-openid4vc'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Icon from 'react-native-vector-icons/Ionicons'

import { hiddenFieldValue } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { ColorPallet } from '../../theme'
import { W3CCredentialAttribute } from '../../types/record'
import { testIdWithKey } from '../../utils/testable'

import RecordBinaryField from './RecordBinaryField'

interface W3CCredentialRecordFieldProps {
  field: W3CCredentialAttribute
  hideFieldValue: boolean
  shown: boolean
  onToggleViewPressed: () => void
  onToggleExpand: () => void
}

export const validEncoding = 'base64'
export const validFormat = new RegExp('^image/(jpeg|png|jpg)')

interface AttributeValueParams {
  field: W3CCredentialAttribute
  shown?: boolean
  style?: Record<string, unknown>
}

const formatStructuredValue = (value: string) => {
  const lines = value.split('\n')
  const formattedLines: JSX.Element[] = []
  let needsIndentation = false

  lines.forEach((line, index) => {
    const trimmedLine = line

    const [key, ...rest] = trimmedLine.split(':')
    if (key && rest.length > 0) {
      const trimmedKey = key
      const restValue = rest.join(':')

      needsIndentation = false

      formattedLines.push(
        <Text key={index}>
          <Text style={{ fontWeight: 'bold' }}>{trimmedKey}: </Text>
          {restValue}
          {'\n\n'}
        </Text>,
      )
    } else if (trimmedLine !== '') {
      formattedLines.push(
        <Text key={index} style={{ marginLeft: needsIndentation ? 20 : 0 }}>
          {trimmedLine}
          {'\n'}
        </Text>,
      )
      needsIndentation = true
    }
  })

  return { formattedLines }
}

export const AttributeValue: React.FC<AttributeValueParams> = ({ field, style, shown }) => {
  const { ListItems } = useTheme()
  const styles = StyleSheet.create({
    text: {
      ...ListItems.recordAttributeText,
      flexWrap: 'wrap',
    },
    image: {
      height: hp('22%'),
      aspectRatio: 1,
      resizeMode: 'contain',
      borderRadius: 10,
    },
  })

  const isBase64Image = (value: string | undefined): boolean => {
    return typeof value === 'string' && /^data:image\/(png|jpg|jpeg|gif|webp);base64,/.test(value)
  }

  const isStructuredValue = /\n/.test(field?.value)
  const { formattedLines } = isStructuredValue ? formatStructuredValue(field?.value) : { formattedLines: [field.value] }

  return (
    <View>
      {shown && isBase64Image(field?.value) ? (
        <RecordBinaryField attributeValue={field.value as string} shown={shown} />
      ) : (
        <Text style={[style || styles.text]} testID={testIdWithKey('AttributeValue')}>
          {shown ? formattedLines : hiddenFieldValue}
        </Text>
      )}
    </View>
  )
}

const W3CCredentialRecordField: React.FC<W3CCredentialRecordFieldProps> = ({
  field,
  hideFieldValue = false,
  shown = !hideFieldValue,
  onToggleViewPressed = () => undefined,
  onToggleExpand = () => undefined,
}) => {
  const { t } = useTranslation()
  const { ListItems } = useTheme()
  const level = field.level || 0
  const styles = StyleSheet.create({
    container: {
      ...ListItems.recordContainer,
      paddingHorizontal: 25,
      paddingVertical: 12,
      marginLeft: level * 15,
      borderBottomWidth: 1,
      borderBottomColor: ColorPallet.grayscale.lightGrey,
    },
    link: {
      ...ListItems.recordLink,
      paddingVertical: 2,
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    valueContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
    },
    valueText: {
      ...ListItems.recordAttributeText,
      flex: 1,
      marginRight: 10,
    },
    keyText: {
      ...ListItems.recordAttributeLabel,
      fontWeight: 'bold',
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    expandIcon: {
      marginRight: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
  })

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <TouchableOpacity
            disabled={!field.isExpandable}
            onPress={() => {
              if (field.isExpandable) {
                onToggleExpand()
              }
            }}
            style={styles.expandIcon}>
            {field.isExpandable && (
              <Icon
                name={field.isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={ColorPallet.brand.primary}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={styles.keyText} testID={testIdWithKey('AttributeName')}>
              {field.key ?? sanitizeString(field.key || '')}
            </Text>
          </TouchableOpacity>

          <View style={styles.valueContainer}>
            {!field.isExpandable && field.value && (
              <View style={styles.valueText}>
                <AttributeValue field={field} shown={shown} />
              </View>
            )}

            {hideFieldValue && !field.isExpandable && field.value && (
              <TouchableOpacity
                accessible={true}
                accessibilityLabel={shown ? t('Record.Hide') : t('Record.Show')}
                testID={testIdWithKey('ShowHide')}
                activeOpacity={1}
                onPress={onToggleViewPressed}
                style={styles.link}
                hitSlop={{ bottom: 10, top: 10, left: 10, right: 10 }}>
                {shown ? (
                  <Icon name="eye" color={ColorPallet.brand.primary} size={20} />
                ) : (
                  <Icon name="eye-off" color={ColorPallet.brand.primary} size={20} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

export default W3CCredentialRecordField
