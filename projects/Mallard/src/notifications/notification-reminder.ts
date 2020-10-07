import { Platform } from 'react-native'
import PushNotification from 'react-native-push-notification'
import { notificationReminderAttemptCache } from 'src/helpers/storage'

const userHasGrantedPermission = (): boolean => {
    PushNotification.checkPermissions(permissions => {
        return permissions === { alert: true, badge: true, sound: true }
    })
    return false
}

const shouldShowReminder = async (hasPermission: boolean): Promise<boolean> => {
    //TODO: check attempt count and date 
    if (!userHasGrantedPermission && Platform.OS === 'ios') {
        const lastReminderAttempt = await notificationReminderAttemptCache.get()
        // reminder attempt hasn't been set
        if (!lastReminderAttempt) {
            notificationReminderAttemptCache.set({ count: 1, date: Date.now() })
            return true
        }
        if (lastReminderAttempt.count == 1 && lastReminderAttempt.date < Date.now())
        return true
    }
    return false
}


export { shouldShowReminder }