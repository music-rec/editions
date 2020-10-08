import { shouldShowNotificationReminder } from '../notification-reminder'
import { notificationReminderAttemptCache } from 'src/helpers/storage'
import moment from 'moment'

describe('helpers/notification-reminder', () => {
    describe('shouldShowNotificationReminder', () => {
        beforeEach(async () => {
            await notificationReminderAttemptCache.reset()
        })
        it('should return true if very first attempt', async () => {
            const showReminder = await shouldShowNotificationReminder()
            expect(showReminder).toEqual(true)
        })
        it('should return false if first attempt was within the last month', async () => {
            await notificationReminderAttemptCache.set({
                count: 1,
                date: moment()
                    .subtract(1, 'week')
                    .toDate(),
            })
            const showReminder = await shouldShowNotificationReminder()
            expect(showReminder).toEqual(false)
        })
        it('should return true if first attempt was longer than a month ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 1,
                date: moment()
                    .subtract(2, 'months')
                    .toDate(),
            })
            const showReminder = await shouldShowNotificationReminder()
            expect(showReminder).toEqual(true)
        })
        it('should return false if second attempt was less than 2 months ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 2,
                date: moment()
                    .subtract(1, 'month')
                    .toDate(),
            })
            const showReminder = await shouldShowNotificationReminder()
            expect(showReminder).toEqual(false)
        })
        it('should return true if 2nd attempt was longer than 2 months ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 2,
                date: moment()
                    .subtract(3, 'months')
                    .toDate(),
            })
            const showReminder = await shouldShowNotificationReminder()
            expect(showReminder).toEqual(true)
        })
        it('should return false if 3rd attempt was less than 6 months ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 3,
                date: moment()
                    .subtract(5, 'months')
                    .toDate(),
            })
            const showReminder = await shouldShowNotificationReminder()
            expect(showReminder).toEqual(false)
        })
        it('should return true if 6th attempt was longer than 6 months ago', async () => {
            await notificationReminderAttemptCache.set({
                count: 6,
                date: moment()
                    .subtract(7, 'months')
                    .toDate(),
            })
            const showReminder = await shouldShowNotificationReminder()
            expect(showReminder).toEqual(true)
        })
    })
})
