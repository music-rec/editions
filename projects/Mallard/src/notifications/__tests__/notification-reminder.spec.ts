import { shouldShowReminder } from '../notification-reminder'
import { notificationReminderAttemptCache } from 'src/helpers/storage'
import moment from 'moment'

// TODO: mock out check permissions method
jest.mock('react-native-push-notification', () => ({
    checkPermissions: () => {
        return false
    },
}))

describe('helpers/notification-reminder', () => {
    describe('shouldShowReminder', () => {
        beforeEach(async () => {
            await notificationReminderAttemptCache.reset()
        })
        it('should return true if very first attempt', async () => {
            const showReminder = await shouldShowReminder()
            expect(showReminder).toEqual(true)
        })
        it('should return false if first attempt was within the last month', async () => {
            await notificationReminderAttemptCache.set({
                count: 1,
                date: moment()
                    .subtract(1, 'week')
                    .toDate(),
            })
            const showReminder = await shouldShowReminder()
            expect(showReminder).toEqual(false)
        })
        it('should return true if first attempt was longer than a month ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 1,
                date: moment()
                    .subtract(2, 'months')
                    .toDate(),
            })
            const showReminder = await shouldShowReminder()
            expect(showReminder).toEqual(true)
        })
        it('should return false if second attempt was less than 2 months ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 2,
                date: moment()
                    .subtract(1, 'month')
                    .toDate(),
            })
            const showReminder = await shouldShowReminder()
            expect(showReminder).toEqual(false)
        })
        it('should return true if 2nd attempt was longer than 2 months ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 2,
                date: moment()
                    .subtract(3, 'months')
                    .toDate(),
            })
            const showReminder = await shouldShowReminder()
            expect(showReminder).toEqual(true)
        })
        // WHY IS THIS FAILING _ NEED TO CHECK SIX MOTHS CHECKER
        it('should return false if 3rd attempt was less than 6 months ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 3,
                date: moment()
                    .subtract(5, 'months')
                    .toDate(),
            })
            const showReminder = await shouldShowReminder()
            expect(showReminder).toEqual(false)
        })
        it('should return true if 6th attempt was longer than 6 months ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 6,
                date: moment()
                    .subtract(7, 'months')
                    .toDate(),
            })
            const showReminder = await shouldShowReminder()
            expect(showReminder).toEqual(true)
        })
    })
})
