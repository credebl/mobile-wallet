import { W3cCredentialRecord } from '@credebl/ssi-mobile-core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, InteractionManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Document from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../../contexts/theme'
import { Field, W3CCredentialAttribute, W3CCredentialAttributeField } from '../../types/record'
import { formatCredentialSubject } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'

import RecordFooter from './RecordFooter'
import RecordHeader from './RecordHeader'
import W3CCredentialRecordField from './W3CCredentialRecordField'

export interface RecordProps {
  header?: () => React.ReactElement | null
  footer?: () => React.ReactElement | null
  fields: Field[]
  hideFieldValues?: boolean
  tables: W3CCredentialAttributeField[]
  w3cCredential?: Pick<W3cCredentialRecord, 'credential'> & {
    credential: Pick<Pick<W3cCredentialRecord, 'credential'>, 'credential'> & {
      prettyVc?: string
    }
  }
  renderCertificate?: () => void
  isCertificateLoading?: boolean
}

const W3CCredentialRecord: React.FC<RecordProps> = ({
  header,
  footer,
  hideFieldValues = false,
  tables,
  w3cCredential,
  renderCertificate,
  isCertificateLoading,
}) => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState<boolean>(false)
  const { ListItems, TextTheme, ColorPallet } = useTheme()
  const [attributes, setAttributes] = useState<W3CCredentialAttribute[]>([])

  const isPrettyVcAvailable =
    w3cCredential?.credential?.prettyVc && Object.keys(w3cCredential?.credential?.prettyVc).length > 0

  const styles = StyleSheet.create({
    linkContainer: {
      ...ListItems.recordContainer,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    link: {
      minHeight: TextTheme.normal.fontSize,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignContent: 'center',
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: isPrettyVcAvailable ? 'space-between' : 'flex-end',
      backgroundColor: ColorPallet.grayscale.white,
    },
    linkText: {
      fontWeight: 'bold',
      color: ColorPallet.brand.primary,
      textDecorationLine: 'underline',
      marginLeft: 5,
    },
    container: {
      flex: 1,
      backgroundColor: ColorPallet.grayscale.white,
    },
    sectionHeader: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: ColorPallet.grayscale.lightGrey,
    },
    sectionHeaderText: {
      ...TextTheme.normal,
      fontWeight: 'bold',
      color: ColorPallet.brand.primary,
    },
  })

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      const applyInitialVisibility = (attrs: W3CCredentialAttribute[]): W3CCredentialAttribute[] => {
        return attrs.map(attr => ({
          ...attr,
          shown: !hideFieldValues ? true : false,
          isExpanded: false,
          children: attr.children ? applyInitialVisibility(attr.children) : undefined,
        }))
      }

      if (tables && tables.length > 0) {
        setAttributes(applyInitialVisibility(tables))
      } else if (w3cCredential?.firstCredential?.credentialSubject ?? w3cCredential?.credential?.credentialSubject) {
        const subject = w3cCredential.firstCredential?.credentialSubject ?? w3cCredential.credential?.credentialSubject
        const formattedAttributes = formatCredentialSubject(subject)
        setAttributes(applyInitialVisibility(formattedAttributes))
      }
    })

    return () => task.cancel()
  }, [tables, w3cCredential, hideFieldValues])

  const handleToggleShowAll = () => {
    const newShowAll = !showAll
    setShowAll(newShowAll)

    const updateAttributes = (attrs: W3CCredentialAttribute[]): W3CCredentialAttribute[] => {
      return attrs.map(attr => {
        const updated = {
          ...attr,
          shown: newShowAll,
          isExpanded: attr.children && attr.children.length > 0 ? newShowAll : attr.isExpanded,
          children: attr.children ? updateAttributes(attr.children) : undefined,
        }
        return updated
      })
    }

    setAttributes(prev => updateAttributes([...prev]))
  }

  const toggleFieldVisibility = (path: number[]): void => {
    const updateAttributeByPath = (
      attrs: W3CCredentialAttribute[],
      currentPath: number[],
      depth = 0,
    ): W3CCredentialAttribute[] => {
      return attrs.map((attr, index) => {
        if (index === currentPath[depth]) {
          if (depth === currentPath.length - 1) {
            return { ...attr, shown: !attr.shown }
          } else if (attr.children) {
            return {
              ...attr,
              children: updateAttributeByPath(attr.children, currentPath, depth + 1),
            }
          }
        }
        return attr
      })
    }

    setAttributes(updateAttributeByPath([...attributes], path))
  }

  const toggleExpand = (path: number[]): void => {
    const updateAttributeByPath = (
      attrs: W3CCredentialAttribute[],
      currentPath: number[],
      depth = 0,
    ): W3CCredentialAttribute[] => {
      return attrs.map((attr, index) => {
        if (index === currentPath[depth]) {
          if (depth === currentPath.length - 1) {
            return { ...attr, isExpanded: !attr.isExpanded }
          } else if (attr.children) {
            return {
              ...attr,
              children: updateAttributeByPath(attr.children, currentPath, depth + 1),
            }
          }
        }
        return attr
      })
    }

    setAttributes(updateAttributeByPath([...attributes], path))
  }

  const renderAttribute = (attr: W3CCredentialAttribute, path: number[] = []): React.ReactNode => {
    return (
      <View key={`${attr.key}-${path.join('-')}`}>
        <W3CCredentialRecordField
          field={attr}
          hideFieldValue={hideFieldValues}
          shown={attr.shown !== undefined ? attr.shown : !hideFieldValues}
          onToggleViewPressed={() => toggleFieldVisibility(path)}
          onToggleExpand={() => toggleExpand(path)}
        />

        {attr.isExpanded && attr.children && (
          <FlatList
            data={attr.children}
            keyExtractor={(item, index) => `${item.key}-${path.join('-')}-${index}`}
            renderItem={({ item, index }) => renderAttribute(item, [...path, index])}
            initialNumToRender={5}
            maxToRenderPerBatch={3}
            removeClippedSubviews={true}
          />
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {header && (
        <RecordHeader>
          {header()}
          <View style={styles.rowContainer}>
            {isPrettyVcAvailable && (
              <View style={styles.linkContainer}>
                {isCertificateLoading ? (
                  <ActivityIndicator size={'small'} color={ColorPallet.brand.primary} />
                ) : (
                  <TouchableOpacity
                    style={styles.link}
                    activeOpacity={1}
                    onPress={renderCertificate}
                    testID={testIdWithKey('ViewDocument')}
                    accessible={true}
                    accessibilityLabel={t('Record.ViewDocument')}>
                    <Document name="file-document-multiple-outline" color={ColorPallet.brand.primary} size={20} />
                    <Text style={[ListItems.recordLink, styles.linkText]}>{t('Record.ViewDocument')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {hideFieldValues && (
              <View style={styles.linkContainer}>
                <TouchableOpacity
                  style={styles.link}
                  activeOpacity={1}
                  onPress={handleToggleShowAll}
                  testID={testIdWithKey('HideAll')}
                  accessible={true}
                  accessibilityLabel={showAll ? t('Record.ShowAll') : t('Record.HideAll')}>
                  {showAll ? (
                    <Icon name="eye" color={ColorPallet.brand.primary} size={30} />
                  ) : (
                    <Icon name="eye-off" color={ColorPallet.brand.primary} size={30} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </RecordHeader>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Claims</Text>
      </View>

      <FlatList
        data={attributes}
        keyExtractor={(item, index) => `${item.key}-${index}`}
        renderItem={({ item, index }) => renderAttribute(item, [index])}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        ListFooterComponent={footer ? <RecordFooter>{footer()}</RecordFooter> : null}
      />
    </View>
  )
}

export default W3CCredentialRecord
