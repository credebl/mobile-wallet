import {
  MdocRecord,
  OpenId4VciAuthorizationFlow,
  OpenId4VciResolvedAuthorizationRequest,
  OpenId4VciResolvedCredentialOffer,
  SdJwtVcRecord,
  W3cCredentialRecord,
  acquireAuthorizationCodeAccessToken,
  acquirePreAuthorizedAccessToken,
  getCredentialForDisplay,
  receiveCredentialFromOpenId4VciOffer,
  resolveOpenId4VciOffer,
} from '@credebl/ssi-mobile-openid4vc'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useOpenIDCredentials } from '../components/Provider/OpenIDCredentialRecordProvider'
import Button, { ButtonType } from '../components/buttons/Button'
import W3CCredentialRecord from '../components/record/W3CCredentialRecord'
import { ColorPallet, TextTheme } from '../theme'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens, TabStacks } from '../types/navigators'
import { W3CCredentialAttributeField } from '../types/record'
import { formatCredentialSubject } from '../utils/credential'
import { useSdk } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type OpenIdCredentialOfferProps = StackScreenProps<NotificationStackParams, Screens.OpenIdCredentialOffer>

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerTextContainer: {
    paddingHorizontal: 25,
    paddingBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    color: ColorPallet.brand.primary,
  },
  connectionLabel: {
    fontWeight: 'normal',
    textAlign: 'center',
    color: ColorPallet.brand.primary,
    fontSize: 22,
  },
  input: {
    height: 40,
    borderColor: ColorPallet.brand.primary,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
    color: ColorPallet.brand.primary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  credentialInfoContainer: {
    marginBottom: 10,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  credentialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: ColorPallet.brand.primary,
  },
  credentialDetail: {
    fontSize: 14,
    color: ColorPallet.brand.primary,
    marginBottom: 4,
  },
  txCodeContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    color: ColorPallet.brand.primary,
  },
  txCodeLabel: {
    marginBottom: 8,
    fontSize: 14,
    color: ColorPallet.brand.primary,
  },
  card: {
    marginTop: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 8,
    height: 136,
    overflow: 'hidden',
  },
  backgroundView: {
    width: '100%',
    borderRadius: 8,
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  formatBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  formatText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  iconContainer: {
    paddingRight: 16,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardFooter: {
    paddingTop: 8,
  },
  footerTextContainer: {
    alignItems: 'flex-start',
  },
  issuerLabel: {
    fontSize: 10,
    opacity: 0.8,
  },
  issuerName: {
    fontSize: 15,
    fontWeight: 'normal',
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  authorizationContainer: {
    padding: 16,
    alignItems: 'center',
  },
  authorizationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: ColorPallet.brand.primary,
  },
  authorizationButton: {
    width: '100%',
  },
})

const authorization = {
  clientId: 'wallet',
  redirectUri: 'id.credebl.adeya:///wallet/redirect',
}

const OpenIdCredentialOffer: React.FC<OpenIdCredentialOfferProps> = ({ navigation, route }) => {
  const { sdk } = useSdk()
  const { t } = useTranslation()
  const { storeOpenIdCredential } = useOpenIDCredentials()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<BifoldError | undefined>()
  const [resolvedOffer, setResolvedOffer] = useState<OpenId4VciResolvedCredentialOffer | undefined>()
  const [resolvedAuthorizationRequest, setResolvedAuthorizationRequest] = useState<
    OpenId4VciResolvedAuthorizationRequest | undefined
  >()
  const [fetchedCredential, setFetchedCredential] = useState<
    W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined
  >()
  const [fetchingPreview, setFetchingPreview] = useState(false)
  const resolvedOfferRef = useRef(resolvedOffer)
  resolvedOfferRef.current = resolvedOffer
  const [needsTxCode, setNeedsTxCode] = useState(false)
  const [needsAuthorization, setNeedsAuthorization] = useState(false)
  const [txCodeSubmitted, setTxCodeSubmitted] = useState(false)
  const [txCode, setTxCode] = useState('')
  const [tables, setTables] = useState<W3CCredentialAttributeField[]>([])
  const txCodeRef = useRef(txCode)

  useEffect(() => {
    txCodeRef.current = txCode
  }, [txCode])

  const retrieveCredentials = useCallback(
    async (tokenResponse: any, configurationId: string) => {
      if (!resolvedOfferRef.current) {
        throw new Error('Credential offer not available')
      }
      const resolvedOffer = resolvedOfferRef.current
      const credentialConfig = resolvedOffer.offeredCredentialConfigurations[configurationId]

      const pidSchemes =
        credentialConfig?.format === 'mso_mdoc' && credentialConfig.doctype
          ? {
              sdJwtVcVcts: [],
              msoMdocDoctypes: [credentialConfig.doctype],
            }
          : credentialConfig?.format === 'vc+sd-jwt' && credentialConfig.vct
          ? {
              sdJwtVcVcts: [credentialConfig.vct as string],
              msoMdocDoctypes: [],
            }
          : undefined

      const credentialResponses = await receiveCredentialFromOpenId4VciOffer({
        sdk,
        resolvedCredentialOffer: resolvedOffer,
        credentialConfigurationIdsToRequest: [configurationId],
        accessToken: tokenResponse,
        pidSchemes,
        requestBatch: true,
        clientId: 'walletId',
      })
      if (!credentialResponses || credentialResponses.length === 0) {
        throw new Error('No credentials received from issuer')
      }

      const firstResponse = credentialResponses[0]
      const credentialRecord = firstResponse?.credential || firstResponse

      if (!credentialRecord) {
        throw new Error('Credential record is undefined')
      }

      setFetchedCredential(credentialRecord as any)

      const display = getCredentialForDisplay(credentialRecord as any)
      const attributesToDisplay =
        display?.attributes && Object.keys(display.attributes).length > 0
          ? display.attributes
          : display?.rawAttributes ?? {}

      const formattedAttributes = formatCredentialSubject(attributesToDisplay)
      const initializeExpandState = (attrs: W3CCredentialAttributeField[]): W3CCredentialAttributeField[] => {
        return attrs
          .filter(attr => {
            const attrKey = attr.key || ''
            return !(
              attrKey?.includes('age_over_18') ||
              attrKey?.includes('age_over_60') ||
              attrKey?.includes('Age Over 18') ||
              attrKey?.includes('Age Over 60')
            )
          })
          .map(attr => {
            const newAttr = { ...attr, isExpanded: attr.level === 0 }
            if (newAttr.children && newAttr.children.length > 0) {
              newAttr.children = initializeExpandState(newAttr.children)
            }
            return newAttr
          })
      }
      setTables(initializeExpandState(formattedAttributes))
      setNeedsAuthorization(false)
    },
    [sdk],
  )

  const acquireCredentialsAuth = useCallback(
    async (authorizationCode: string) => {
      if (!resolvedOffer || !resolvedAuthorizationRequest) {
        setError(new BifoldError(t('Error.Title1024'), 'Credential information could not be extracted', '', 1024))
        return
      }

      const configurationId = resolvedOffer.credentialOfferPayload.credential_configuration_ids[0]
      if (!configurationId) {
        setError(new BifoldError(t('Error.Title1024'), 'No credential configuration ID found', '', 1024))
        return
      }

      setFetchingPreview(true)
      try {
        const tokenResponse = await acquireAuthorizationCodeAccessToken({
          sdk,
          resolvedCredentialOffer: resolvedOffer,
          redirectUri: authorization.redirectUri,
          authorizationCode,
          clientId: authorization.clientId,
          codeVerifier:
            'codeVerifier' in resolvedAuthorizationRequest ? resolvedAuthorizationRequest.codeVerifier : undefined,
        })

        await retrieveCredentials(tokenResponse, configurationId)
      } catch (error) {
        setError(new BifoldError(t('Error.Title1024'), 'Error while retrieving credentials', '', 1024))
      } finally {
        setFetchingPreview(false)
      }
    },
    [resolvedOffer, resolvedAuthorizationRequest, retrieveCredentials, sdk, t],
  )

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (url.startsWith(authorization.redirectUri)) {
        const urlObj = new URL(url)
        const code = urlObj.searchParams.get('code')
        const errorParam = urlObj.searchParams.get('error')

        if (errorParam) {
          setError(new BifoldError(t('Error.Title1024'), 'Authorization failed', '', 1024))
          return
        }

        if (code) {
          acquireCredentialsAuth(code)
        }
      }
    }

    const subscription = Linking.addEventListener('url', handleDeepLink)

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [sdk, resolvedOffer, resolvedAuthorizationRequest])

  const handleAuthorizePress = useCallback(async () => {
    if (!resolvedAuthorizationRequest) {
      Alert.alert('Error', 'Authorization information not available')
      return
    }

    try {
      const supported = await Linking.canOpenURL(resolvedAuthorizationRequest.authorizationRequestUrl)
      if (supported) {
        await Linking.openURL(resolvedAuthorizationRequest.authorizationRequestUrl)
      } else {
        Alert.alert('Error', 'Cannot open authorization URL')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open authorization page')
    }
  }, [resolvedAuthorizationRequest, sdk])

  const fetchCredentialPreview = useCallback(
    async (txCode?: string) => {
      if (!resolvedOfferRef.current) {
        throw new Error('Credential offer not available')
      }
      const resolvedOffer = resolvedOfferRef.current

      const configurationId = resolvedOffer.credentialOfferPayload.credential_configuration_ids[0]
      if (!configurationId) {
        throw new Error('No credential configuration ID found')
      }

      const tokenResponse = await acquirePreAuthorizedAccessToken({
        sdk,
        resolvedCredentialOffer: resolvedOffer,
        txCode,
      })

      if (!tokenResponse || !tokenResponse.accessToken) {
        throw new Error('Failed to acquire access token for preview')
      }

      await retrieveCredentials(tokenResponse, configurationId)
    },
    [sdk, retrieveCredentials],
  )

  const handleAcceptTouched = useCallback(async () => {
    if (!fetchedCredential) {
      Alert.alert('Error', 'Credential data not available. Please try again.')
      return
    }
    try {
      setProcessing(true)
      await storeOpenIdCredential(sdk, fetchedCredential)
      setProcessing(false)
      navigation.getParent()?.navigate(TabStacks.CredentialStack, {
        screen: Screens.Credentials,
        params: { credentialId: fetchedCredential.id },
      })
    } catch (err: unknown) {
      setProcessing(false)
      Alert.alert('Credential Storage Failed', `Failed to store credential: ${(err as Error).message}`, [
        { text: 'OK' },
      ])
    }
  }, [fetchedCredential, storeOpenIdCredential, sdk, navigation])

  const handleTxCodeSubmit = useCallback(async () => {
    if (!txCode.trim()) {
      Alert.alert('Error', 'Please enter the transaction code')
      return
    }

    setFetchingPreview(true)
    try {
      await fetchCredentialPreview(txCode)
      setTxCodeSubmitted(true)
      setNeedsTxCode(false)
    } catch (err: unknown) {
      Alert.alert('Preview Failed', `Failed to fetch credential details: ${(err as Error).message}`, [{ text: 'OK' }])
    } finally {
      setFetchingPreview(false)
    }
  }, [txCode, fetchCredentialPreview])

  const handleDeclineTouched = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  useEffect(() => {
    const initializeOffer = async () => {
      try {
        setLoading(true)

        let currentResolvedOffer: OpenId4VciResolvedCredentialOffer
        let currentResolvedAuthRequest: OpenId4VciResolvedAuthorizationRequest | undefined

        if ('uri' in route.params) {
          const resolved = await resolveOpenId4VciOffer({
            sdk,
            offer: {
              uri: route.params.uri,
            },
            authorization,
          })

          currentResolvedOffer = resolved.resolvedCredentialOffer
          currentResolvedAuthRequest = resolved.resolvedAuthorizationRequest
        } else {
          currentResolvedOffer = route.params as OpenId4VciResolvedCredentialOffer
        }

        if (!currentResolvedOffer?.credentialOfferPayload?.credential_configuration_ids) {
          const error = new Error('Invalid credential offer: missing credential_configuration_ids')
          throw error
        }

        setResolvedOffer(currentResolvedOffer)
        setResolvedAuthorizationRequest(currentResolvedAuthRequest)

        const credentialConfigId = currentResolvedOffer.credentialOfferPayload.credential_configuration_ids[0]
        const credentialConfig = currentResolvedOffer.offeredCredentialConfigurations[credentialConfigId]

        if (!credentialConfig) {
          throw new Error(`Invalid credential configuration: ${credentialConfigId}`)
        }

        const grants = currentResolvedOffer.credentialOfferPayload.grants
        const preAuthGrant = grants?.['urn:ietf:params:oauth:grant-type:pre-authorized_code']

        const isBrowserAuthFlow =
          currentResolvedAuthRequest?.authorizationFlow === OpenId4VciAuthorizationFlow.Oauth2Redirect

        if (isBrowserAuthFlow) {
          setNeedsAuthorization(true)
        } else if (preAuthGrant?.tx_code) {
          setNeedsTxCode(true)
        } else if (preAuthGrant) {
          setFetchingPreview(true)
          try {
            await fetchCredentialPreview()
          } catch (e) {
            const error = new BifoldError(t('Error.Title1024'), (e as Error).message, (e as Error).stack, 1024)
            setError(error)
          } finally {
            setFetchingPreview(false)
          }
        } else {
          throw new Error('Unsupported grant type')
        }
      } catch (e: unknown) {
        const error = new BifoldError(t('Error.Title1024'), (e as Error).message, (e as Error).stack, 1024)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    initializeOffer()
  }, [sdk, route.params, t, fetchCredentialPreview])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: ColorPallet.brand.primary }}>{error.message}</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          buttonType={ButtonType.Secondary}
          testID={testIdWithKey('GoBack')}
        />
      </View>
    )
  }

  const credentialConfig =
    resolvedOffer?.offeredCredentialConfigurations[resolvedOffer.credentialOfferPayload.credential_configuration_ids[0]]
  const issuerDisplay = resolvedOffer?.metadata?.credentialIssuer?.display?.[0]

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.card}>
            <ImageBackground
              source={{ uri: credentialConfig?.display?.[0].background_image?.uri }}
              style={[styles.backgroundView, { backgroundColor: credentialConfig?.display?.[0].background_color }]}
              imageStyle={styles.backgroundImage}
              resizeMode="cover">
              {credentialConfig && (
                <View style={styles.formatBadge}>
                  <Text style={styles.formatText}>{credentialConfig.format}</Text>
                </View>
              )}
              <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    {issuerDisplay?.logo?.url ? (
                      <Image
                        source={{
                          uri: issuerDisplay.logo.url,
                        }}
                        resizeMode="contain"
                        alt={issuerDisplay.logo.altText}
                        width={64}
                        height={48}
                      />
                    ) : null}
                  </View>
                  <View style={styles.textContainer}>
                    <Text
                      style={[
                        TextTheme.normal,
                        styles.textContainer,
                        {
                          fontWeight: 'bold',
                          lineHeight: 24,
                          flexWrap: 'wrap',
                          color: credentialConfig?.display?.[0].text_color,
                        },
                      ]}
                      numberOfLines={2}>
                      {credentialConfig?.display?.[0].name}
                    </Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
              <Text style={styles.connectionLabel}>
                {issuerDisplay?.name || credentialConfig?.display?.[0]?.name || 'Issuer'}
              </Text>
              {' is offering you a credential'}
            </Text>
          </View>

          {needsAuthorization && !fetchedCredential && (
            <View style={styles.authorizationContainer}>
              <Text style={styles.authorizationText}>
                To receive this credential, you need to authorize with the issuer. Please click the button below to
                proceed with authentication.
              </Text>
              <Button
                title="Authorize with Issuer"
                accessibilityLabel="Authorize with Issuer"
                onPress={handleAuthorizePress}
                testID={testIdWithKey('AuthorizeButton')}
                buttonType={ButtonType.Primary}
                style={styles.authorizationButton}
                disabled={processing}
              />
            </View>
          )}

          {needsTxCode && !txCodeSubmitted && (
            <View style={styles.txCodeContainer}>
              <Text style={styles.txCodeLabel}>Please enter the transaction code provided by the issuer:</Text>
              <TextInput
                style={styles.input}
                placeholder="Transaction Code"
                placeholderTextColor={ColorPallet.brand.primary}
                value={txCode}
                onChangeText={setTxCode}
                autoCapitalize="none"
                keyboardType="numeric"
                editable={!processing}
              />
            </View>
          )}

          {fetchingPreview && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 8, color: ColorPallet.brand.primary }}>Fetching credential details...</Text>
            </View>
          )}

          {!fetchingPreview && fetchedCredential && (
            <W3CCredentialRecord tables={tables} fields={[]} hideFieldValues={false} />
          )}
        </ScrollView>
        {needsTxCode && !txCodeSubmitted && (
          <View style={{ marginHorizontal: 10 }}>
            <Button
              title="Submit Code"
              accessibilityLabel="Submit Code"
              onPress={handleTxCodeSubmit}
              testID={testIdWithKey('SubmitCode')}
              buttonType={ButtonType.Primary}
              disabled={processing || !txCode.trim()}
            />
          </View>
        )}
        <View style={styles.footer}>
          {processing ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 8, color: ColorPallet.brand.primary }}>Processing credential...</Text>
            </View>
          ) : (
            fetchedCredential &&
            !fetchingPreview && (
              <View style={styles.buttonContainer}>
                <Button
                  title="Decline"
                  accessibilityLabel="Decline"
                  onPress={handleDeclineTouched}
                  testID={testIdWithKey('DeclineCredential')}
                  buttonType={ButtonType.Secondary}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Accept"
                  accessibilityLabel="Accept"
                  onPress={handleAcceptTouched}
                  testID={testIdWithKey('AcceptCredential')}
                  buttonType={ButtonType.Primary}
                  style={{ flex: 1 }}
                />
              </View>
            )
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}
export default OpenIdCredentialOffer
