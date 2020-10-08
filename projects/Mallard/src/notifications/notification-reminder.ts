import { Platform } from 'react-native'
import PushNotification from 'react-native-push-notification'
import { notificationReminderAttemptCache } from 'src/helpers/storage'
import moment from 'moment'

const userHasGrantedPermission = (): boolean => {
    PushNotification.checkPermissions(permissions => {
        return permissions === { alert: true, badge: true, sound: true }
    })
    return false
}

const shouldShowReminder = async (): Promise<boolean> => {
    // TODO: check if permission has been granted and if platform is iOS
    const lastReminderAttempt = await notificationReminderAttemptCache.get()
    const oneMonthAgo = moment()
        .subtract(1, 'month')
        .toDate()
    const twoMonthsAgo = moment()
        .subtract(2, 'months')
        .toDate()
    const sixMonthsAgo = moment()
        .subtract(6, 'months')
        .toDate()
    const oneMonthSinceFirstAttempt =
        lastReminderAttempt &&
        lastReminderAttempt.count == 1 &&
        moment(lastReminderAttempt.date).isBefore(oneMonthAgo)
    const twoMonthsSinceSecondAttempt =
        lastReminderAttempt &&
        lastReminderAttempt.count == 2 &&
        moment(lastReminderAttempt.date).isBefore(twoMonthsAgo)
    const sixMonthsSincePreviousAttempt =
        lastReminderAttempt &&
        lastReminderAttempt.count > 2 &&
        moment(lastReminderAttempt.date).isBefore(sixMonthsAgo)

    // first attempt
    if (!lastReminderAttempt) {
        notificationReminderAttemptCache.set({
            count: 1,
            date: moment().toDate(),
        })
        return true
    }
    if (
        oneMonthSinceFirstAttempt ||
        twoMonthsSinceSecondAttempt ||
        sixMonthsSincePreviousAttempt
    ) {
        notificationReminderAttemptCache.set({
            count: lastReminderAttempt.count += 1,
            date: moment().toDate(),
        })
        return true
    }
    return false
}

export { shouldShowReminder }
