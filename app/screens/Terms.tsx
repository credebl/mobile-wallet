import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import InfoTextBox from '../components/texts/InfoTextBox'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const terms: {
  title: string
  subtitle: { [key: string]: string }
}[] = [
  {
    title: '1. Validity of the General Terms and Conditions',
    subtitle: {
      '1.1':
        "The usage of the 'ADEYA' Self-sovereign Identity Edge Wallet (the 'ADEYA App') is subject to these general terms and conditions (the 'GTC'). The ADEYA App offers constant access to and viewing of the GTC.",
      '1.2':
        'The terms of these GTC apply to the use of the ADEYA App and associated services as well as the provision of all services and advantages linked to the ADEYA App.',
      '1.3':
        'AYANWORKS Technology Solutions Pvt Ltd Company provides users with access to self-sovereign identification networks through the ADEYA App in accordance with the terms of these GTC.',
      '1.4':
        "Other general terms and conditions, such as the user's, do not apply, despite the user's wants. Only if AYANWORKS Technology Solutions Pvt Ltd Company expressly agrees to the user's general terms and conditions does the user presume their validity.",
      '1.5':
        'The legality of the remaining sections of these GTC shall not be impacted if any provision is or becomes illegal by influx of law or due to passage of time. The user and AYANWORKS Technology Solutions Pvt Ltd Company agree to discuss the grounds for the invalidity of the provision to come up with a replacement provision that closely resembles its goals.',
      '1.6': 'In the case of contractual discrepancy or variations, the same rule (Section 1.5) applies.',
    },
  },
  {
    title: "2. The CREDEBL Platform’s & ADEYA App's Purpose and Object of Performance",
    subtitle: {
      '2.1':
        'The CREDEBL Platform (Verifiable Credential & Decentralised Identity management platform) and ADEYA App (Self-sovereign Identity Edge Wallet Application) are designed to securely store user credentials using cryptography. It allows users to safeguard their verifiable credentials and embrace the convenience of an identity wallet on their smartphones without compromising privacy. AYANWORKS Technology Solutions develops the CREDEBL Platform and ADEYA App.',
      '2.2':
        'The CREDEBL Platform and ADEYA App are intended for the digital identification and authentication of natural persons. Users can obtain and store identity information about themselves from other participants and share it if required. The identity information may include legitimation data, creditworthiness data, payment transaction data, registration data, and other text-based information.',
      '2.3':
        'The CREDEBL Platform and ADEYA App connect to self-sovereign identity networks, enabling peer-to-peer connections with other participants. Users can exchange encrypted messages and receive other participants\' identity information ("verifiable credentials"). They can also respond to identity requests from participants by sharing the relevant stored identity information. The CREDEBL Platform is also connected to a digital mailbox service (SendGrid), ensuring secure message delivery.',
    },
  },
  {
    title: '3. Application/Registration',
    subtitle: {
      '3.1':
        'No login or registration with AYANWORKS Technology Solutions is required to use the CREDEBL Platform and ADEYA App.',
    },
  },
  {
    title: '4. The "CREDEBL" Platform’s & "ADEYA" App\'s availability and changes, as well as services related to it:',
    subtitle: {
      '4.1':
        'After the “CREDEBL” Platform and "ADEYA" App have been opened or installed respectively, the user may use it and any connected AYANWORKS Technology Solutions services in accordance with the terms and conditions set out in this agreement.',
      '4.2':
        'The “CREDEBL” Platform and "ADEYA" App and the services and advantages connected to it are continuously made available by AYANWORKS Technology Solutions. However, the “CREDEBL” Platform and "ADEYA" App and the services and advantages connected to it are not guaranteed, obligated to be available at all the time, or subject to responsibility by AYANWORKS Technology Solutions.',
      '4.3':
        'Additionally, AYANWORKS Technology Solutions is free to suspend or stop using the “CREDEBL” Platform and "ADEYA" App, as well as the features and services connected to it, at any time, regardless of outside factors beyond its control. AYANWORKS Technology Solutions has all discretion over the timing, scope, and length of any suspensions it imposes and whether to execute any necessary maintenance or repairs. These decisions are not subject to judicial scrutiny.',
      '4.4':
        'The AYANWORKS Technology Solutions reserves the right to prohibit and/or ban the use of the “CREDEBL” Platform and "ADEYA" App at any time and to stop offering services associated with the “CREDEBL” Platform and "ADEYA" App. Such activities are not subject to justification and may be carried out at the sole discretion of AYANWORKS Technology Solutions, including in a way that is not susceptible to judicial scrutiny.',
      '4.5':
        'The “CREDEBL” Platform and "ADEYA" App may undergo modifications at any moment, at the sole discretion of AYANWORKS Technology Solutions, including but not limited to the type and extent of changes. The company is under no obligation to notify users of such changes.',
    },
  },
  {
    title: '5. Consent to the use of data and information of the user',
    subtitle: {
      '5.1':
        'By selecting the appropriate field during the opening or installation of the “CREDEBL” Platform and "ADEYA" App, respectively, the user confirms his consent to the entirety of these GTC, and specifically to the following points:',
      A: 'A user\'s identification data will initially only be saved on the “CREDEBL” Platform and "ADEYA" App and won\'t be shared with other parties until the user expressly agrees to it.',
      B: 'The user agrees that some personal data may be collected and processed by the “CREDEBL” Platform and "ADEYA" App in order for it to operate properly and provide the services it offers. This data may include the user\'s name, contact information, device information, and any other facts the user freely submits inside the platform and app.',
      C: 'The user grants AYANWORKS Technology Solutions permission to gather and analyse anonymous user data and statistics about the “CREDEBL” Platform and "ADEYA" App in order to enhance its functionality, performance, and user experience. This information will be handled in compliance with the relevant data protection laws and rules applicable to India which may be further amended from time to time.',
      D: 'The user is aware of and accepts that the “CREDEBL” Platform and "ADEYA" App secures and protects user credentials and data using cryptography and encryption techniques. The user understands that no security solution is perfect and that AYANWORKS Technology Solutions cannot completely guarantee the protection of user data. The user is in charge of adopting the necessary safety measures to protect their device and access to the platform & app.',
      E: 'The user acknowledges and accepts that when they access or use the “CREDEBL” Platform and "ADEYA" App, AYANWORKS Technology Solutions may use cookies or other similar technologies to gather certain information. IP addresses, unique device identifiers, surfing habits, and other relevant data may be included in this information.',
      F: 'The user is aware of and consents to the processing of their personal data by AYANWORKS Technology Solutions in compliance with all applicable data protection laws and regulations, including the General Data Protection Regulation (GDPR) and other pertinent privacy legislation.',
      G: 'By closing and uninstalling the “CREDEBL” Platform and "ADEYA" App respectively and ceasing to use them, the user has the right to withdraw their consent to the collection, processing, and storage of their personal information at any time. The user is aware, however, that such a withdrawal of permission may prevent them from using certain of the platform’s and app\'s features or services.',
    },
  },
  {
    title: '6. Intellectual Property Rights',
    subtitle: {
      '6.1':
        'The “CREDEBL” Platform and "ADEYA" App (including but not limited to its design, layout, graphics, text, and other content, as well as any software, algorithms, and underlying technologies), are protected by intellectual property rights and is owned or licenced by AYANWORKS Technology Solutions. The “CREDEBL” Platform and "ADEYA" App can be used by the user for personal and non-commercial reasons, but only with a limited, non-exclusive, and non-transferable right.',
      '6.2':
        'The user acknowledges that they will not, without AYANWORKS Technology Solutions written approval, reproduce, edit, distribute, display, perform, publish, licence, create derivative works from, or sell any portion of the “CREDEBL” Platform and "ADEYA" App.',
      '6.3':
        'Any copyright, trademark, or other property rights notices included in or accompanying the “CREDEBL” Platform and "ADEYA" App may not be removed, altered, or obscured by the user.',
    },
  },
  {
    title: '7. Limitation of Liability',
    subtitle: {
      '7.1':
        'Users acknowledge that they are using the “CREDEBL” Platform and "ADEYA" App at their own risk. AYANWORKS Technology Solutions disclaims all responsibility for any harm that may result from using the “CREDEBL” Platform and "ADEYA" App, including but not limited to any direct, indirect, incidental, consequential, or punitive damages.',
      '7.2':
        'AYANWORKS Technology Solutions disclaims all responsibility for any delays, interruptions, errors, or omissions in the “CREDEBL” Platform and "ADEYA" App\'s operation or any component thereof, as well as for any failure to perform, whether brought on by divine intervention, technical issues, unauthorised access, theft, or other causes outside of AYANWORKS Technology Solutions control.',
      '7.3':
        'With regard to the accuracy, dependability, or fitness of the “CREDEBL” Platform and "ADEYA" App for any given purpose, the company makes no representations or guarantees of any kind, either stated or implied. On an "as-is" and "as-available" basis, the app is made available.',
      '7.4':
        'The user understands that the company AYANWORKS Technology Solutions cannot ensure the continuous or error-free operation of the “CREDEBL” Platform and "ADEYA" App and that any dependence on its functionality is done at the user\'s own risk.',
      '7.5':
        'AYANWORKS Technology Solutions responsibility is restricted to the fullest extent permissible by law in places where the exclusion or limitation of liability for consequential or incidental damages is not permitted.',
    },
  },
  {
    title: '8. Termination',
    subtitle: {
      '8.1':
        'AYANWORKS Technology Solutions retains the right to deny or restrict a user\'s access to the “CREDEBL” Platform and "ADEYA" App at any time and for any reason, including but not limited to a violation of these general terms and conditions, without prior warning or responsibility.',
      '8.2':
        'The user has the option to stop using the “CREDEBL” Platform and "ADEYA" App whenever they choose by uninstalling it and doing so.',
      '8.3':
        'If the agreement is terminated, the user\'s right to use the “CREDEBL” Platform and "ADEYA" App will end immediately, and they must uninstall it as soon as possible and remove any copies of it from their devices.',
    },
  },
  {
    title: '9. Governing Law and Dispute Resolution',
    subtitle: {
      '9.1':
        'The Indian laws will be applicable to the present contract without regard to its rules on conflicts of laws and the same shall govern these general terms and conditions and be followed in interpreting them.',
      '9.2':
        'In case of any dispute arising out of the said agreement of general terms and conditions the same shall be resolved as far as possible amicably but in case the same cannot be resolved amicably then the dispute shall be referred to a Sole Arbitrator appointed by AYANWORKS Technology Solutions, India and the same shall be governed by provisions of Arbitration and Conciliation Act, 1996 of Government of India, and further amended from time to time. The seat and place of Arbitration shall be Pune, Maharashtra, India and the language of Arbitration proceedings shall be English.',
      '9.3':
        'Further, the Courts of Pune shall have exclusive jurisdiction to decide the dispute which may so arise in case the Arbitration proceedings cannot decide the dispute between the parties to the present agreement.',
    },
  },
  {
    title: '10. Severability',
    subtitle: {
      '10.1':
        'The remaining terms of these general terms and conditions shall remain in full force and effect in the event that any provision is judged to be invalid, unlawful, or unenforceable.',
    },
  },
  {
    title: '11. Entire Agreement',
    subtitle: {
      '11.1':
        'These general terms and conditions replace all prior or contemporaneous oral or written agreements, communications, or understandings with respect to the subject matter hereof and represent the complete agreement between the user and AYANWORKS Technology Solutions with regard to the use of the “CREDEBL” Platform and "ADEYA" App.',
    },
  },
  {
    title: '12. Contact Information',
    subtitle: {
      '12.1':
        'Users can get in touch with AYANWORKS Technology Solutions at info@ayanworks.com if they have any questions, issues, or suggestions about these GTC or the “CREDEBL” Platform and the "ADEYA" App.\n\n01-SEP-2023 Date on which these general terms and conditions take effect.',
    },
  },
]

const Terms: React.FC = () => {
  const [store, dispatch] = useStore()
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const { OnboardingTheme, TextTheme } = useTheme()
  const onSubmitPressed = () => {
    dispatch({
      type: DispatchAction.DID_AGREE_TO_TERMS,
    })

    navigation.navigate(Screens.CreatePIN)
  }
  const style = StyleSheet.create({
    container: {
      ...OnboardingTheme.container,
      padding: 20,
    },
    bodyText: {
      ...TextTheme.normal,
      flexShrink: 1,
    },
    titleText: {
      ...TextTheme.normal,
      marginTop: 20,
      fontWeight: 'bold',
      flexShrink: 1,
    },
    controlsContainer: {
      marginTop: 'auto',
      marginBottom: 20,
    },
    paragraph: {
      flexDirection: 'row',
      marginTop: 20,
    },
    enumeration: {
      ...TextTheme.normal,
      marginRight: 15,
    },
  })

  const onBackPressed = () => {
    navigation.navigate(Screens.Onboarding)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']}>
      <ScrollView style={[style.container]}>
        <InfoTextBox>Please agree to the terms and conditions below before using this application.</InfoTextBox>

        <View style={{ marginBottom: 5 }}>
          {terms.map((para, index) => (
            <View key={index} style={{ marginBottom: index === terms.length - 1 ? 25 : 0 }}>
              <Text style={style.titleText}>{para.title}</Text>
              {Object.keys(para.subtitle).map(subtitleCount => (
                <View key={subtitleCount} style={style.paragraph}>
                  <Text style={[style.enumeration]}>{subtitleCount}</Text>
                  <Text style={[style.bodyText]}>{para.subtitle[subtitleCount]}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={[style.controlsContainer]}>
          {!(store.onboarding.didAgreeToTerms && store.authentication.didAuthenticate) && (
            <>
              <CheckBoxRow
                title={t('Terms.Attestation')}
                accessibilityLabel={t('Terms.IAgree')}
                testID={testIdWithKey('IAgree')}
                checked={checked}
                onPress={() => setChecked(!checked)}
              />
              <View style={[{ paddingTop: 10 }]}>
                <Button
                  title={t('Global.Continue')}
                  accessibilityLabel={t('Global.Continue')}
                  testID={testIdWithKey('Continue')}
                  disabled={!checked}
                  onPress={onSubmitPressed}
                  buttonType={ButtonType.Primary}
                />
              </View>
              <View style={[{ paddingTop: 10, marginBottom: 20 }]}>
                <Button
                  title={t('Global.Back')}
                  accessibilityLabel={t('Global.Back')}
                  testID={testIdWithKey('Back')}
                  onPress={onBackPressed}
                  buttonType={ButtonType.Secondary}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Terms
