import { importWalletToStore } from '@credebl/ssi-mobile-core'
import { pick, types } from '@react-native-documents/picker'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  Platform,
  BackHandler,
  Keyboard,
  ScrollView,
} from 'react-native'
import ReactNativeBlobUtil from 'react-native-blob-util'
import * as RNFS from 'react-native-fs'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import { Toast } from 'react-native-toast-message/lib/src/Toast'
import { unzip } from 'react-native-zip-archive'

import ButtonLoading from '../components/animated/ButtonLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import { ToastType } from '../components/toast/BaseToast'
import { walletId } from '../constants'
import { useAuth } from '../contexts/auth'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'

type ImportWalletVerifyProps = StackScreenProps<AuthenticateStackParams, Screens.ImportWalletVerify>

const ImportWalletVerify: React.FC<ImportWalletVerifyProps> = ({ navigation }) => {
  const { ColorPallet } = useTheme()
  const [PassPhrase, setPassPhrase] = useState('')
  const { getWalletCredentials } = useAuth()
  const [verify, setVerify] = useState(false)
  const [selectedFilePath, setSelectedFilePath] = useState('')
  const { height } = Dimensions.get('window')
  const { width } = Dimensions.get('window')

  const styles = StyleSheet.create({
    container: {
      height: '100%',
    },
    dottedBox: {
      marginTop: height / 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textInputStyle: {
      borderRadius: 10,
      borderWidth: 2,
      borderColor: ColorPallet.brand.primary,
      color: ColorPallet.brand.primary,
      width: width - 40,
      paddingLeft: width / 20,
      textAlignVertical: 'top',
      alignItems: 'center',
      fontSize: Platform.OS === 'ios' ? height / 50 : height / 45,
      justifyContent: 'flex-start',
      height: Platform.OS === 'ios' ? height / 9 : height / 8,
    },
    textInputView: {
      width,
      margin: 20,
    },
    textView: {
      width,
      margin: 20,
    },
    detailText: {
      justifyContent: 'flex-start',
      fontSize: 25,
      color: ColorPallet.brand.primary,
    },
    verifyButton: {
      marginTop: heightPercentageToDP('50%'),
      margin: 20,
      flex: 2,
    },
  })
  useEffect(() => {
    const handleBackButtonClick = () => {
      navigation.goBack()
      return true
    }
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick)
    return () => {
      // BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick)
    }
  }, [navigation])

  const initAgent = async (seed: string): Promise<void> => {
    setVerify(true)
    Keyboard.dismiss()
    const credentials = await getWalletCredentials()
    console.log('🚀 ~ initAgent ~ credentials:', credentials)
    if (!credentials?.id || !credentials.key) {
      // Cannot find wallet id/secret
      return
    }
    try {
      if (!seed) {
        setVerify(false)
        Toast.show({
          type: ToastType.Error,
          text1: `Please enter passphrase`,
        })
        return
      }

      const encodeHash = seed.replaceAll(' ', '').trim()

      const { fs } = ReactNativeBlobUtil
      const restoreDirectoryPath = `${fs.dirs.DocumentDir}`
      const walletFilePath = `${restoreDirectoryPath}/CREDEBL_WALLET_RESTORE/CREDEBL_WALLET.wallet`

      await unzip(selectedFilePath, restoreDirectoryPath + '/CREDEBL_WALLET_RESTORE')

      await importWalletToStore(
        {
          id: walletId,
          key: credentials.key,
        },
        {
          id: walletId,
          key: encodeHash,
          database: {
            type: 'sqlite' as const,
            config: {
              path: walletFilePath,
            },
          },
        },
      )

      await RNFS.unlink(restoreDirectoryPath + '/CREDEBL_WALLET_RESTORE')

      Toast.show({
        type: ToastType.Success,
        text1: `Wallet imported successfully`,
        visibilityTime: 2000,
        position: 'bottom',
      })
      navigation.navigate(Screens.UseBiometry)
    } catch (e: unknown) {
      console.error('Wallet import error:', e)
      Toast.show({
        type: ToastType.Error,
        text1: 'Wallet import failed. Please try again',
        visibilityTime: 5000,
        position: 'bottom',
      })
      setVerify(false)
    }
  }

  const verifyPassPhrase = async (seed: string) => {
    const result = seed.replaceAll(',', ' ')
    if (result) {
      await initAgent(result)
    } else {
      Toast.show({
        type: ToastType.Error,
        text1: `Please enter passphrase`,
        visibilityTime: 2000,
        position: 'bottom',
      })
    }
  }

  const handleSelect = async () => {
    try {
      const [res] = await pick({
        type: [types.zip],
        copyTo: 'documentDirectory',
      })

      if (res.fileCopyUri) {
        // Already copied to document directory — strip file:// to get a plain fs path
        setSelectedFilePath(res.fileCopyUri.replace(/^file:\/\//, ''))
        return
      }

      if (!res.uri) {
        Toast.show({
          type: ToastType.Error,
          text1: 'Could not access the selected file',
        })
        navigation.goBack()
        return
      }

      // fileCopyUri was null (copy failed) — manually copy from content URI to a local path
      const destPath = `${RNFS.DocumentDirectoryPath}/wallet_import_temp.zip`
      await RNFS.copyFile(res.uri, destPath)
      setSelectedFilePath(destPath)
    } catch (error) {
      navigation.goBack()

      Toast.show({
        type: ToastType.Error,
        text1: (error as Error).message || 'Unknown error',
      })
    }
  }

  useEffect(() => {
    handleSelect()
  }, [])

  const handleUserPhrase = (text: string) => {
    setPassPhrase(text)
  }

  return (
    <ScrollView style={styles.container} keyboardDismissMode="on-drag">
      <View style={styles.textView}>
        <Text style={styles.detailText}>Enter your secret phrase here</Text>
      </View>
      <View style={styles.textInputView}>
        <TextInput
          style={styles.textInputStyle}
          multiline
          autoCapitalize="none"
          autoFocus
          onChangeText={handleUserPhrase}
        />
      </View>
      <View style={styles.verifyButton}>
        <Button
          title={'Verify'}
          buttonType={ButtonType.Primary}
          accessibilityLabel={'okay'}
          disabled={verify}
          onPress={() => verifyPassPhrase(PassPhrase)}>
          {verify && <ButtonLoading />}
        </Button>
      </View>
    </ScrollView>
  )
}

export default ImportWalletVerify
