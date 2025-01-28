import { exportWallet as exportAdeyaWallet } from '@adeya/ssi'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { useNavigation, useRoute } from '@react-navigation/core'
import { GDrive, ListQueryBuilder, MimeTypes } from '@robinbobin/react-native-google-drive-api-wrapper'
import shuffle from 'lodash.shuffle'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PixelRatio,
  StyleSheet,
  Platform,
  Share,
} from 'react-native'
import * as RNFS from 'react-native-fs'
import Toast from 'react-native-toast-message'
import { zip } from 'react-native-zip-archive'

import ButtonLoading from '../components/animated/ButtonLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import { ToastType } from '../components/toast/BaseToast'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { useAppAgent } from '../utils/agent'

function ExportWalletConfirmation() {
  const { agent } = useAppAgent()
  const navigation = useNavigation()
  const parms = useRoute()
  const { t } = useTranslation()
  const [phraseData, setPhraseData] = useState<string[]>([])
  const [arraySetPhraseData, setArraySetPhraseData] = useState<string[]>([])
  const [nextPhraseIndex, setNextPhraseIndex] = useState(0)
  const [matchPhrase, setMatchPhrase] = useState(false)

  const { ColorPallet, TextTheme } = useTheme()
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
  const { width } = Dimensions.get('window')
  const widthBaseScale = SCREEN_WIDTH / 414
  const heightBaseScale = SCREEN_HEIGHT / 896

  const normalize = (size: number, based: 'width' | 'height' = 'width') => {
    const newSize = based === 'height' ? size * heightBaseScale : size * widthBaseScale
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  }
  const widthPixel = (size: number) => normalize(size, 'width')
  const heightPixel = (size: number) => normalize(size, 'height')

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-around',
      height: '100%',
    },
    scrollview: {
      flex: 1,
    },
    titleText: {
      fontSize: 26,
      marginTop: 15,
      textAlign: 'center',
      color: ColorPallet.brand.labelText,
    },
    detailText: {
      fontSize: 18,
      marginHorizontal: 30,
      marginTop: 20,
      lineHeight: 20,
      textAlign: 'center',
      color: ColorPallet.brand.primary,
    },
    successText: {
      fontSize: 14,
    },
    successView: { justifyContent: 'center', alignItems: 'center' },
    setPhraseView: {
      width: width - 60,
    },
    addPhraseView: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: heightPixel(50),
    },
    rowAddItemContainerView: {
      width: widthPixel(150),
      marginVertical: 10,
      padding: 7,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rowAddItemText: {
      fontSize: 20,
      color: ColorPallet.grayscale.black,
    },
    rowItemIndexText: {
      width: 20,
      textAlign: 'center',
    },
    rowItemPhraseText: {
      fontSize: 20,
    },
    rowItemContainerView: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
    },
    rowAItemContainerView: {
      flexDirection: 'row',
      width: widthPixel(150),
      margin: 10,
      padding: 7,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
      borderWidth: 1.3,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    backupButton: {
      margin: 20,
    },
  })

  useEffect(() => {
    const shuffledPhraseData: string[] = shuffle(parms?.params?.phraseData)
    setPhraseData(shuffledPhraseData)
    setArraySetPhraseData(Array(shuffledPhraseData.length).fill(''))
  }, [])

  const exportWallet = async (seed: string) => {
    setMatchPhrase(true)
    const encodeHash = seed

    try {
      let downloadDirectory = ''
      if (Platform.OS === 'ios') {
        downloadDirectory = RNFS.DocumentDirectoryPath
      } else {
        downloadDirectory = RNFS.DownloadDirectoryPath
      }

      const backupTimeStamp = moment().format('YYYY-MM-DD-HH-mm-ss')
      // const backupDirectory = `${documentDirectory}/Wallet_Backup`
      const zipUpDirectory = `${downloadDirectory}/CREDEBL-Wallet-${backupTimeStamp}`

      const destFileExists = await RNFS.exists(zipUpDirectory)
      if (destFileExists) {
        await RNFS.unlink(zipUpDirectory)
      }

      const WALLET_FILE_NAME = 'CREDEBL_WALLET'

      const zipFileName = `${WALLET_FILE_NAME}-${backupTimeStamp}.zip`
      await RNFS.mkdir(zipUpDirectory)
      const encryptedFileName = `${WALLET_FILE_NAME}.wallet`
      const encryptedFileLocation = `${zipUpDirectory}/${encryptedFileName}`
      const destinationZipPath = `${downloadDirectory}/${zipFileName}`

      const exportConfig = {
        key: encodeHash,
        path: encryptedFileLocation,
      }

      await exportAdeyaWallet(agent, exportConfig)

      await zip(zipUpDirectory, destinationZipPath)

      await RNFS.unlink(zipUpDirectory)

      if (parms?.params?.backupType === 'google_drive') {
        const gdrive = new GDrive()
        gdrive.accessToken = (await GoogleSignin.getTokens()).accessToken
        gdrive.fetchCoercesTypes = true
        gdrive.fetchRejectsOnHttpErrors = true
        gdrive.fetchTimeout = 15000

        const zipFileData = await RNFS.readFile(destinationZipPath, 'base64')
        try {
          const { result } = await gdrive.files.createIfNotExists(
            {
              q: new ListQueryBuilder()
                .e('name', 'CREDEBL Wallet Backups')
                .and()
                .e('mimeType', MimeTypes.FOLDER)
                .and()
                .in('root', 'parents'),
            },
            gdrive.files.newMetadataOnlyUploader().setRequestBody({
              name: 'CREDEBL Wallet Backups',
              mimeType: MimeTypes.FOLDER,
              parents: ['root'],
            }),
          )

          const response = await gdrive.files
            .newMultipartUploader()
            .setData(zipFileData, 'application/zip')
            .setIsBase64(true)
            .setRequestBody({
              name: zipFileName,
              parents: [result.id],
            })
            .execute()

          const folderData = await gdrive.files.getMetadata(result.id)
          const fileData = await gdrive.files.getMetadata(response.id)
          Toast.show({
            type: ToastType.Success,
            text1: t('GoogleDrive.BackupSuccess'),
          })
          setMatchPhrase(true)
          navigation.navigate(Screens.Success, {
            encryptedFileLocation: `Backup file uploaded successfully to Google Drive\n\nFolder: ${folderData.name}\n\nFile: ${fileData.name}`,
          })
          return
        } catch (e) {
          Toast.show({
            type: ToastType.Error,
            text1: t('GoogleDrive.BackupFailed'),
            position: 'bottom',
          })
          return
        }
      } else {
        if (Platform.OS === 'ios') {
          await Share.share({
            title: 'Share backup zip file',
            url: destinationZipPath,
          })
        }
      }

      Toast.show({
        type: ToastType.Success,
        text1: 'Backup successfully completed',
      })
      setMatchPhrase(true)
      navigation.navigate(Screens.Success, { encryptedFileLocation: destinationZipPath })
    } catch (e) {
      Toast.show({
        type: ToastType.Error,
        text1: 'Backup failed',
      })
    }
  }

  const addPhrase = (item: string) => {
    if (nextPhraseIndex <= 7) {
      const updatedPhraseData = [...phraseData]
      updatedPhraseData[nextPhraseIndex] = item

      const updatedArraySetPhraseData = [...arraySetPhraseData]
      updatedArraySetPhraseData[nextPhraseIndex] = item

      setArraySetPhraseData(updatedArraySetPhraseData)
      setNextPhraseIndex(nextPhraseIndex + 1)
    } else {
      setNextPhraseIndex(0)
    }
  }

  const setPhrase = (item: string, index: number) => {
    const updatedArraySetPhraseData = [...arraySetPhraseData]
    updatedArraySetPhraseData[index] = ''
    setArraySetPhraseData(updatedArraySetPhraseData)
    setNextPhraseIndex(index)
  }

  const verifyPhrase = async () => {
    const addedPassPhraseData = arraySetPhraseData.join('')
    const displayedPassphrase = parms?.params?.phraseData.map(item => item).join('')
    if (displayedPassphrase.trim() !== '') {
      const sysPassPhrase = addedPassPhraseData.trim()
      const userPassphrase = displayedPassphrase.trim()
      if (sysPassPhrase === userPassphrase) {
        await exportWallet(sysPassPhrase)
      } else {
        Toast.show({
          type: ToastType.Error,
          text1: 'Phrase not matched',
        })
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={[TextTheme.headerTitle, styles.titleText]}>{t('Backup.confirm_seed_phrase')}</Text>
        <Text style={[TextTheme.label, styles.detailText]}>{t('Backup.select_each')}</Text>
      </View>
      <ScrollView>
        <View style={[styles.addPhraseView]}>
          {arraySetPhraseData?.map((item, index) => (
            <TouchableOpacity onPress={() => setPhrase(item, index)} key={index} disabled={matchPhrase}>
              <View style={styles.rowItemContainerView}>
                <View
                  style={[
                    styles.rowAItemContainerView,
                    {
                      borderStyle: item !== '' || index === nextPhraseIndex ? 'solid' : 'dashed',
                      borderColor:
                        item !== '' || index === nextPhraseIndex
                          ? ColorPallet.brand.primary
                          : ColorPallet.brand.primary,
                    },
                  ]}>
                  <Text style={[TextTheme.label, styles.rowItemPhraseText]}>{item}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.setPhraseView} />
          {phraseData.map((item, index) => (
            <TouchableOpacity
              disabled={matchPhrase}
              onPress={() => addPhrase(item)}
              style={[styles.rowAddItemContainerView]}
              key={index}>
              <View>
                <Text style={[styles.rowAddItemText]}>{item}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.backupButton}>
        <Button
          title={'COMPLETE BACKUP'}
          accessibilityLabel={'Okay'}
          disabled={matchPhrase}
          buttonType={ButtonType.Primary}
          onPress={verifyPhrase}>
          {matchPhrase && <ButtonLoading />}
        </Button>
      </View>
    </ScrollView>
  )
}

export default ExportWalletConfirmation
