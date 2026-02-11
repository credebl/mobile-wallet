import { useConnections } from '@credebl/ssi-mobile-didcomm'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/core'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, Text, Image, ScrollView } from 'react-native'
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Toast from 'react-native-toast-message'

import useOrganizationDetailData from '../api/organizationDetailHelper'
import Button, { ButtonType } from '../components/buttons/Button'
import { ToastType } from '../components/toast/BaseToast'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { Screens, Stacks } from '../types/navigators'
import {
  checkIfAlreadyConnected,
  connectFromInvitation,
  fetchUrlData,
  getJson,
  getUrl,
  isValidUrl,
  receiveMessageFromUrlRedirect,
  useSdk,
} from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

interface OrganizationDetailProps {
  name: string
  description: string
  logoUrl: string
  orgSlug: string
}

const OrganizationDetails: React.FC = () => {
  const { ColorPallet, ListItems, TextTheme } = useTheme()
  const { sdk } = useSdk()
  const navigation = useNavigation()
  const { t } = useTranslation()
  const params = useRoute<RouteProp<Record<string, OrganizationDetailProps>, string>>().params
  const { organizationDetailData, credentialDetailData } = useOrganizationDetailData(params?.orgSlug)
  const [invitationUrl, setInvitationUrl] = useState('')
  const [disableConnect, setDisableConnect] = useState(false)
  const { records } = useConnections()
  const connections = records

  const isAlreadyConnected = useMemo(() => {
    return connections?.some(
      connection => connection.theirLabel?.replace(/\s/g, '').trim() === params?.name.replace(/\s/g, '').trim(),
    )
  }, [connections, params])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
      margin: '2.5%',
    },
    headerTextView: {
      justifyContent: 'center',
      alignSelf: 'center',
    },
    titleText: {
      fontSize: 20,
      fontWeight: '400',
      alignSelf: 'center',
      color: ColorPallet.brand.primary,
      marginTop: 5,
    },
    avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
      height: 80,
      borderRadius: 40,
      borderColor: ListItems.avatarCircle.borderColor,
      borderWidth: 1,
      flexDirection: 'row',
      marginLeft: 15,
    },
    descriptionLabel: {
      marginLeft: 15,
      marginTop: 5,
    },
    orgHeaderText: {
      fontSize: 17,
      color: ColorPallet.brand.primary,
      fontWeight: '700',
    },
    avatarOrgImage: {
      width: 50,
      height: 50,
    },
    orgNameContainer: {
      paddingVertical: 10,
      borderWidth: 1,
      borderRadius: 10,
      borderColor: ColorPallet.brand.primaryLight,
      marginVertical: 10,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    orgDescriptionContainer: {
      minHeight: hp('15%'),
      maxHeight: hp('20%'),
      paddingVertical: 10,
      borderWidth: 1,
      borderRadius: 10,
      borderColor: ColorPallet.brand.primaryLight,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    credentialContainer: {
      height: hp('20%'),
      marginTop: 10,
      paddingVertical: 10,
      borderWidth: 1,
      borderRadius: 10,
      borderColor: ColorPallet.brand.primaryLight,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    labelText: {
      marginTop: 10,
      marginHorizontal: 15,
      fontSize: 16,
    },
    avatarOrgPlaceholder: {
      ...TextTheme.headingFour,
    },
    orgContainer: {
      fontWeight: '600',
      color: ColorPallet.brand.primary,
      fontSize: 17,
    },
    button: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    credLabel: {
      fontSize: 18,
      fontWeight: '600',
      width: '90%',
      marginHorizontal: 10,
      marginBottom: 10,
    },
    orgLabelContainer: {
      width: '65%',
      marginLeft: 10,
      marginRight: 5,
    },
    contactItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  const organizationLabelAbbr = useMemo(() => params?.name?.charAt(0).toUpperCase(), [params])

  const handleInvitation = async (value: string): Promise<void> => {
    try {
      const { connectionRecord, outOfBandRecord } = await connectFromInvitation(sdk, value)

      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: connectionRecord?.id, outOfBandId: outOfBandRecord.id },
      })
    } catch (err: unknown) {
      try {
        const json = getJson(value)
        if (json) {
          await sdk?.receiveMessage(json)
          navigation.getParent()?.navigate(Stacks.ConnectionStack, {
            screen: Screens.Connection,
            params: { threadId: json['@id'] },
          })
          return
        }

        const urlData = await fetchUrlData(value)
        const isValidURL = isValidUrl(urlData)

        if (isValidURL) {
          const isAlreadyConnected = await checkIfAlreadyConnected(sdk, urlData)

          if (isAlreadyConnected) {
            Toast.show({
              type: ToastType.Warn,
              text1: t('Contacts.AlreadyConnected'),
            })
            navigation.goBack()
            return
          }

          const { connectionRecord, outOfBandRecord } = await connectFromInvitation(sdk, urlData)

          navigation.getParent()?.navigate(Stacks.ConnectionStack, {
            screen: Screens.Connection,
            params: { connectionId: connectionRecord?.id, outOfBandId: outOfBandRecord.id },
          })
          return
        }
        const url = getUrl(value)
        if (url) {
          const message = await receiveMessageFromUrlRedirect(value, sdk)
          navigation.getParent()?.navigate(Stacks.ConnectionStack, {
            screen: Screens.Connection,
            params: { threadId: message['@id'] },
          })
          return
        }
      } catch (err: unknown) {
        const error = new BifoldError(t('Error.Title1031'), t('Error.Message1031'), (err as Error).message, 1031)
        throw error
      }
    }
  }

  useEffect(() => {
    const [agentInvitations] = organizationDetailData.map(item => item?.agent_invitations)

    if (!agentInvitations || agentInvitations.length === 0) {
      return
    }
    let connectionInvitationUrl = ''
    if (agentInvitations.length === 1) {
      connectionInvitationUrl = agentInvitations[0]?.connectionInvitation
      setInvitationUrl(connectionInvitationUrl)
    } else if (agentInvitations.length > 1) {
      connectionInvitationUrl = agentInvitations[agentInvitations.length - 1]?.connectionInvitation
      setInvitationUrl(connectionInvitationUrl)
    }
  }, [organizationDetailData])

  const connectOrganization = async () => {
    setDisableConnect(true)
    try {
      if (!invitationUrl) {
        Toast.show({
          type: ToastType.Error,
          text1: 'No connection invitation available',
        })
        setDisableConnect(false)
        return
      }

      await handleInvitation(invitationUrl)
    } catch (error) {
      Toast.show({
        type: ToastType.Error,
        text1: 'Accepting connection invitation failed',
      })
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.headerTextView}>
        <Text style={styles.titleText}>{t('Organizations.TitleDetail')}</Text>
      </View>
      <View style={styles.orgNameContainer}>
        <View style={styles.contactItemContainer}>
          <View style={styles.avatarContainer}>
            {params?.logoUrl ? (
              <Image style={styles.avatarOrgImage} source={{ uri: params.logoUrl }} />
            ) : (
              <Text style={styles.avatarOrgPlaceholder}>{organizationLabelAbbr}</Text>
            )}
          </View>
          <View style={styles.orgLabelContainer}>
            <Text style={styles.orgContainer}>{params?.name}</Text>
          </View>
        </View>
      </View>
      <View style={styles.orgDescriptionContainer}>
        <View style={styles.descriptionLabel}>
          <Text style={styles.orgHeaderText}>{t('Organizations.AboutOrganization')}</Text>
        </View>
        <ScrollView>
          <View>
            <Text style={styles.labelText}>{params?.description}</Text>
          </View>
        </ScrollView>
      </View>
      {credentialDetailData.length > 0 && (
        <View style={styles.credentialContainer}>
          <View style={styles.descriptionLabel}>
            <Text style={styles.orgHeaderText}>{t('Organizations.AvailableCredentials')}</Text>
          </View>
          <ScrollView>
            {credentialDetailData.map(item => (
              <View key={item?.credentialDefinitionId}>
                <Text style={styles.labelText}>{item?.tag}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {!isAlreadyConnected && (
        <View style={styles.button}>
          <Button
            onPress={connectOrganization}
            title={t('Organizations.Connect')}
            accessibilityLabel={'Connect'}
            testID={testIdWithKey('Connect')}
            buttonType={ButtonType.Primary}
            disabled={disableConnect}
          />
        </View>
      )}
    </View>
  )
}

export default OrganizationDetails
