import { MaterialIcons } from '@react-native-vector-icons/material-icons'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { SafeAreaView } from 'react-native-safe-area-context'

import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

const DataRetention: React.FC = () => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const { ColorPallet, TextTheme, SettingsTheme } = useTheme()
  const [useDataRetention, setUseDataRetention] = useState<boolean>(!!store.preferences.useDataRetention)

  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      width: '100%',
    },
    section: {
      backgroundColor: SettingsTheme.groupBackground,
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemSeparator: {
      borderBottomWidth: 1,
      borderBottomColor: ColorPallet.brand.primaryBackground,
      marginHorizontal: 25,
    },
  })

  const updateDataRetention = (state: boolean) => {
    dispatch({
      type: DispatchAction.USE_DATA_RETENTION,
      payload: [state],
    })
    setUseDataRetention(state)
  }

  const renderBouncyCheckbox = (accessibilityLabel: string, onPress: () => void, isChecked: boolean) => (
    <BouncyCheckbox
      accessibilityLabel={accessibilityLabel}
      disableText
      fillColor={ColorPallet.brand.secondaryBackground}
      unfillColor={ColorPallet.brand.secondaryBackground}
      size={36}
      innerIconStyle={{ borderColor: ColorPallet.brand.primary, borderWidth: 2 }}
      ImageComponent={() => <MaterialIcons name="circle" size={18} color={ColorPallet.brand.primary}></MaterialIcons>}
      onPress={onPress}
      isChecked={isChecked}
      disableBuiltInState
      testID={testIdWithKey('dataRetentionOn')}
    />
  )

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={[styles.section, styles.sectionRow]}>
        <Text style={[TextTheme.title]}>{t('Global.On')}</Text>
        {renderBouncyCheckbox(t('Global.On'), () => updateDataRetention(true), useDataRetention)}
      </View>
      <View style={{ backgroundColor: SettingsTheme.groupBackground }}>
        <View style={[styles.itemSeparator]}></View>
      </View>
      <View style={[styles.section, styles.sectionRow]}>
        <Text style={[TextTheme.title]}>{t('Global.Off')}</Text>
        {renderBouncyCheckbox(t('Global.Off'), () => updateDataRetention(false), !useDataRetention)}
      </View>
    </SafeAreaView>
  )
}

export default DataRetention
