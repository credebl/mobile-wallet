import type { StackScreenProps } from '@react-navigation/stack'

import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Pdf from 'react-native-pdf'
import { SafeAreaView } from 'react-native-safe-area-context'
import Share, { ShareOptions } from 'react-native-share'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { ColorPallet } from '../theme'
import { CredentialStackParams, Screens } from '../types/navigators'

type RenderCertificateProps = StackScreenProps<CredentialStackParams, Screens.RenderCertificate>

const RenderCertificate: React.FC<RenderCertificateProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('RenderCertificate route prams were not set properly')
  }

  const { filePath } = route?.params

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: 25,
    },
    pdf: {
      width: '100%',
      height: '100%',
    },
  })

  const downloadPdf = async () => {
    try {
      const shareOptions: ShareOptions = { url: filePath }
      await Share.open(shareOptions)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('error downloading html to pdf', e)
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={downloadPdf} style={{ marginRight: 20 }}>
          <Icon style={{ color: ColorPallet.grayscale.white }} size={25} name="share" />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Pdf source={{ uri: filePath }} style={styles.pdf} maxScale={10.0} />
    </SafeAreaView>
  )
}

export default RenderCertificate
