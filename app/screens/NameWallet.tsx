import { useNavigation } from '@react-navigation/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import LimitedTextInput from '../components/inputs/LimitedTextInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import PopupModal from '../components/modals/PopupModal'
import KeyboardView from '../components/views/KeyboardView'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { generateRandomWalletName } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'
import { useSdk } from '../utils/agent'

type ErrorState = {
  visible: boolean
  title: string
  description: string
}
type SuccessState = {
  visible: boolean
  title: string
  description: string
}

const NameWallet: React.FC = () => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const navigation = useNavigation()
  const [store, dispatch] = useStore()
  const { sdk } = useSdk()
  const [walletName, setWalletName] = useState(store.preferences.walletName ?? generateRandomWalletName())
  const onBoardingComplete =
    store.onboarding.didCompleteTutorial &&
    store.onboarding.didAgreeToTerms &&
    store.onboarding.didCreatePIN &&
    store.onboarding.didConsiderBiometry
  const [errorState, setErrorState] = useState<ErrorState>({
    visible: false,
    title: '',
    description: '',
  })
  const [successState, setsuccessState] = useState<SuccessState>({
    visible: false,
    title: '',
    description: '',
  })

  const styles = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },

    contentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    // below used as helpful label for view, no properties needed atp
    controlsContainer: {},

    buttonContainer: {
      width: '100%',
    },
    labelText: {
      width: '100%',
      marginBottom: 16,
      color: ColorPallet.brand.primary,
    },
    svgAsset: {
      marginVertical: 20,
    },
    inputView: {
      width: '100%',
    },
    noteText: {
      fontWeight: '400',
    },
  })

  const handleChangeText = (text: string) => {
    setWalletName(text)
  }

  const handleContinuePressed = () => {
    if (walletName.length < 1) {
      setErrorState({
        title: t('NameWallet.EmptyNameTitle'),
        description: t('NameWallet.EmptyNameDescription'),
        visible: true,
      })
    } else if (walletName.length > 25) {
      setErrorState({
        title: t('NameWallet.CharCountTitle'),
        description: t('NameWallet.CharCountDescription'),
        visible: true,
      })
    } else {
      setsuccessState({
        title: 'Ready to proceed?',
        description: 'The name will apply to any new connection',
        visible: true,
      })
    }
  }

  const handleDismissError = () => {
    setErrorState(prev => ({ ...prev, visible: false }))
  }
  const handleSuccess = () => {
    dispatch({
      type: DispatchAction.UPDATE_WALLET_NAME,
      payload: [walletName],
    })
    if (sdk) {
      sdk.config.label = walletName
    }
    dispatch({ type: DispatchAction.DID_NAME_WALLET })
    if (onBoardingComplete) {
      navigation.goBack()
    } else {
      navigation.navigate({ name: Screens.WalletOptions } as never)
    }
    setsuccessState(prev => ({ ...prev, visible: false }))
  }
  const handleDissmiss = () => {
    setsuccessState(prev => ({ ...prev, visible: false }))
  }
  return (
    <KeyboardView>
      <View style={styles.screenContainer}>
        <View style={styles.contentContainer}>
          <Assets.svg.contactBook height={100} style={[styles.svgAsset]} />
          <Text style={[TextTheme.normal, styles.labelText]}>{t('NameWallet.ThisIsTheName')}</Text>
          <View style={styles.inputView}>
            <LimitedTextInput
              defaultValue={walletName}
              label={t('NameWallet.NameYourWallet')}
              limit={25}
              handleChangeText={handleChangeText}
              accessibilityLabel={t('NameWallet.NameYourWallet')}
              testID={testIdWithKey('NameInput')}
            />

            <Text style={[TextTheme.normal, styles.noteText]}>
              Note: Feel free to customize the wallet name according to your preferences
            </Text>
          </View>
        </View>
        <View style={styles.controlsContainer}>
          <View style={styles.buttonContainer}>
            <Button
              title={t('Global.Continue')}
              buttonType={ButtonType.Primary}
              testID={testIdWithKey('Continue')}
              accessibilityLabel={t('Global.Continue')}
              onPress={handleContinuePressed}></Button>
          </View>
        </View>
      </View>
      {successState.visible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          onCallToActionLabel={'Yes'}
          onCallToActionPressed={handleDissmiss}
          onCallToActionProceed={handleSuccess}
          title={successState.title}
          description={successState.description}
        />
      )}
      {errorState.visible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={handleDismissError}
          title={errorState.title}
          description={errorState.description}
        />
      )}
    </KeyboardView>
  )
}

export default NameWallet
