import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import PushNotificationsModal from '../components/modals/PushNotificationsModal'
import { isMediatorCapable, isRegistered, setup, isUserDenied } from '../utils/PushNotificationHelper'
import { useSdk } from '../utils/agent'

const PushNotifications = () => {
  const { sdk } = useSdk()
  const { t } = useTranslation()
  const [infoModalVisible, setInfoModalVisible] = useState(false)

  const setupPushNotifications = async () => {
    setInfoModalVisible(false)
    if (!sdk || (await isUserDenied())) return
    setup(sdk, false)
  }

  const initializeCapabilityRequest = async () => {
    if (!sdk || !(await isMediatorCapable(sdk)) || (await isRegistered())) return
    setInfoModalVisible(true)
  }

  useEffect(() => {
    initializeCapabilityRequest()
  }, [sdk]) // Reload if agent becomes defined

  return (
    <PushNotificationsModal
      title={t('PushNotifications.Title')}
      visible={infoModalVisible}
      onDone={setupPushNotifications}
    />
  )
}

export default PushNotifications
