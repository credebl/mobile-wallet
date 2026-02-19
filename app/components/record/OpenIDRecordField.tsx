import { Field } from '@hyperledger/aries-oca/build/legacy'
import { MaterialIcons } from '@react-native-vector-icons/material-icons'
import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { W3CCredentialAttribute } from '../../types/record'
import { testIdWithKey } from '../../utils/testable'

import RecordField from './RecordField'

interface OpenIDRecordFieldProps {
  field: Field | W3CCredentialAttribute
  hideBottomBorder?: boolean
}

const isW3CAttribute = (field: Field | W3CCredentialAttribute): field is W3CCredentialAttribute => {
  return 'key' in field && !('name' in field)
}

const NestedAttribute: React.FC<{
  attribute: W3CCredentialAttribute
  hideBottomBorder?: boolean
}> = ({ attribute, hideBottomBorder }) => {
  const { ListItems, ColorPallet } = useTheme()
  const [isExpanded, setIsExpanded] = useState(attribute.isExpanded ?? false)

  const styles = StyleSheet.create({
    container: {
      ...ListItems.recordContainer,
      paddingHorizontal: 25 + (attribute.level ?? 0) * 15,
      paddingTop: 16,
    },
    border: {
      ...ListItems.recordBorder,
      borderBottomWidth: 2,
      paddingTop: 12,
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      ...ListItems.recordAttributeLabel,
      fontWeight: 'bold',
      flex: 1,
    },
    valueContainer: {
      paddingTop: 5,
    },
    valueText: {
      ...ListItems.recordAttributeText,
      paddingVertical: 4,
    },
    expandButton: {
      padding: 5,
      marginLeft: 10,
    },
  })

  const toggleExpand = () => {
    if (attribute.isExpandable) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <Text style={styles.label} testID={testIdWithKey('AttributeName')}>
            {attribute.key || ''}
          </Text>
          {attribute.isExpandable && (
            <TouchableOpacity onPress={toggleExpand} style={styles.expandButton} testID={testIdWithKey('ExpandToggle')}>
              <MaterialIcons
                name={field.isExpanded ? 'expand-more' : 'chevron-right'}
                color={ColorPallet.brand.primary}
                size={20}
              />
            </TouchableOpacity>
          )}
        </View>

        {attribute.value && !attribute.isExpandable && (
          <View style={styles.valueContainer}>
            <Text style={styles.valueText} testID={testIdWithKey('AttributeValue')}>
              {attribute.value}
            </Text>
          </View>
        )}

        <View style={[styles.border, hideBottomBorder && { borderBottomWidth: 0 }]} />
      </View>

      {attribute.isExpandable && isExpanded && attribute.children && (
        <>
          {attribute.children.map((child, index) => (
            <NestedAttribute
              key={`${child.key}-${index}`}
              attribute={child}
              hideBottomBorder={index === attribute.children!.length - 1 && hideBottomBorder}
            />
          ))}
        </>
      )}
    </>
  )
}

const OpenIDRecordField: React.FC<OpenIDRecordFieldProps> = ({ field, hideBottomBorder = false }) => {
  if (isW3CAttribute(field)) {
    return <NestedAttribute attribute={field} hideBottomBorder={hideBottomBorder} />
  } else {
    return <RecordField field={field} hideFieldValue={false} shown={true} hideBottomBorder={hideBottomBorder} />
  }
}

export default OpenIDRecordField
