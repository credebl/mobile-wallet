import React from 'react'
import { Image, ScrollView, StyleSheet, Text, View, ImageBackground } from 'react-native'
import { SvgProps } from 'react-native-svg'

import onBoardingOrganizeEase from '../assets/img/onBoardingOrganizeease.svg'
import onBoardingDataSafe from '../assets/img/onBoardingdatasafe.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import { useStore } from '../contexts/store'
import { styles } from '../onboardingStyles'
import { ITheme, theme } from '../theme'
import { GenericFn } from '../types/fn'
import { testIdWithKey } from '../utils/testable'

import { OnboardingStyleSheet } from './Onboarding'

export const createCarouselStyle = (OnboardingTheme: any): OnboardingStyleSheet => {
  return StyleSheet.create({
    container: {
      ...OnboardingTheme.container,
      flex: 1,
      alignItems: 'center',
    },
    carouselContainer: {
      ...OnboardingTheme.carouselContainer,
      flexDirection: 'column',
    },
    pagerContainer: {
      flexShrink: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 30,
    },
    pagerDot: {
      ...OnboardingTheme.pagerDot,
      borderWidth: 1,
      borderStyle: 'solid',
    },
    pagerDotActive: {
      ...OnboardingTheme.pagerDotActive,
    },
    pagerDotInactive: {
      ...OnboardingTheme.pagerDotInactive,
    },
    pagerPosition: {
      position: 'relative',
      top: 0,
    },
    pagerNavigationButton: {
      ...OnboardingTheme.pagerNavigationButton,
      fontSize: 18,
      fontWeight: 'bold',
    },
  })
}

export const createStyles = (OnboardingTheme: any) => {
  return StyleSheet.create({
    headerText: {
      ...OnboardingTheme.headerText,
    },
    bodyText: {
      ...OnboardingTheme.bodyText,
      flexShrink: 1,
    },
    point: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 20,
      marginTop: 10,
      marginRight: 20,
      marginBottom: 10,
    },
    icon: {
      marginRight: 10,
    },
  })
}

const OnboardingPages = (onTutorialCompleted: GenericFn): Array<Element> => {
  const EndPage = (onTutorialCompleted: GenericFn, theme: ITheme['OnboardingTheme']) => {
    const [store] = useStore()

    const defaultStyle = createStyles(theme)

    return (
      <>
        <View style={styles.endPageContainer}>
          <Text style={[defaultStyle.headerText, styles.headerText, { marginTop: 20 }]}>Share Securely</Text>
          <ScrollView style={styles.ScrollView} contentContainerStyle={{ justifyContent: 'center' }}>
            <Image source={require('../assets/img/sharesecure.png')} style={[styles.backgroundImage]} />
            <View style={styles.descriptionText}>
              <Text style={[styles.bodyText]}>
                Take complete control over your data. Securely connect with people and organizations to share necessary
                information without compromising your privacy.
              </Text>
            </View>
          </ScrollView>
          {!(store.onboarding.didCompleteTutorial && store.authentication.didAuthenticate) && (
            <View style={styles.startedButtonContainer}>
              <Button
                title="Get Started"
                accessibilityLabel="Get Started"
                testID={testIdWithKey('GetStarted')}
                onPress={onTutorialCompleted}
                buttonType={ButtonType.Primary}
              />
            </View>
          )}
        </View>
      </>
    )
  }

  const StartPages = (theme: ITheme) => {
    const defaultStyle = createStyles(theme)
    return (
      <ScrollView style={styles.container}>
        <Text style={[defaultStyle.headerText, styles.headerText]}>Welcome!</Text>
        <ImageBackground source={require('../assets/img/onBoardingfirst.png')} style={styles.backgroundImage}>
          <Image source={require('../assets/img/face-scan.png')} style={styles.Image} />
        </ImageBackground>

        <View style={styles.descriptionText}>
          <Text style={[styles.bodyText]}>
            Unlock the power of your digital identity with our all-in-one wallet! Let's embark on a journey to take full
            control of your digital presence.
          </Text>
        </View>
      </ScrollView>
    )
  }

  const guides: Array<{
    image: React.FC<SvgProps>
    title: string
    body: string
  }> = [
    {
      image: onBoardingDataSafe,
      title: 'Keep your data safe',
      body: 'Safeguard your digital Credentials with CREDEBL, ensuring that your data remains protected and shared with your consent only.',
    },
    {
      image: onBoardingOrganizeEase,
      title: 'Organize with ease',
      body: 'Organize and manage your digital credentials effortlessly within CREDEBL. Say goodbye to paper documents and embrace the convenience of an identity wallet in your hand.',
    },
  ]

  const CreatePageWith = (image: React.FC<SvgProps>, title: string, body: string, theme: ITheme['OnboardingTheme']) => {
    const defaultStyle = createStyles(theme)
    const imageDisplayOptions = {
      fill: '',
      height: 245,
      width: 345,
    }
    return (
      <ScrollView style={styles.container}>
        <Text style={[defaultStyle.headerText, styles.headerText]}>{title}</Text>
        <View style={styles.guideImages}>{image(imageDisplayOptions)}</View>
        <View style={styles.descriptionText}>
          <Text style={[styles.bodyText]}>{body}</Text>
        </View>
      </ScrollView>
    )
  }
  return [
    StartPages(theme),
    ...guides.map(g => CreatePageWith(g.image, g.title, g.body, theme)),
    EndPage(onTutorialCompleted, theme),
  ]
}

export default OnboardingPages
