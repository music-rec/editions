import { ErrorService } from '../errors'
import { getMockPromise } from 'src/authentication/__tests__/test-helpers'
import { GdprSwitchSettings } from 'src/helpers/settings'

type Sub = (key: keyof GdprSwitchSettings, value: boolean) => void

const createEmitter = () => {
    let cb: Sub = () => {}

    return {
        emit: (key: keyof GdprSwitchSettings, value: boolean) => {
            cb(key, value)
        },
        sub: (fn: Sub) => {
            cb = fn
            return () => {
                cb = () => {}
            }
        },
    }
}

const createSentry = () => ({
    config: jest.fn(() => ({
        install: jest.fn(() => Promise.resolve()),
    })),
    captureException: jest.fn(() => {}),
})

describe('errors', () => {
    describe('ErrorService', () => {
        it('should not do anything with calling `init`', async () => {
            const getSetting = getMockPromise(true)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            await Promise.resolve()

            errorService.captureException(new Error())

            expect(sentry.config).not.toHaveBeenCalled()
            expect(sentry.captureException).not.toHaveBeenCalled()
        })

        it('should default to not having consent', () => {
            const getSetting = getMockPromise(true)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            errorService.captureException(new Error())

            expect(sentry.config).not.toHaveBeenCalled()
            expect(sentry.captureException).not.toHaveBeenCalled()
        })

        it('should install the if consent is set to true', async () => {
            const getSetting = getMockPromise(true)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            await Promise.resolve()

            expect(sentry.config).toHaveBeenCalledTimes(1)
        })

        it('should not install without consent', async () => {
            const getSetting = getMockPromise(false)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            await Promise.resolve()

            expect(sentry.config).not.toHaveBeenCalled()
        })

        it('should install only after consent is set to true', async () => {
            const getSetting = getMockPromise(false)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            await Promise.resolve()

            emitter.emit('gdprAllowPerformance', true)

            expect(sentry.config).toHaveBeenCalledTimes(1)
        })

        it('should only listen for the relevant key', async () => {
            const getSetting = getMockPromise(false)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            await Promise.resolve()

            emitter.emit('gdprAllowFunctionality', true)

            expect(sentry.config).not.toHaveBeenCalled()

            errorService.captureException(new Error())

            expect(sentry.captureException).not.toHaveBeenCalled()
        })

        it('should not fire errors without consent', async () => {
            const getSetting = getMockPromise(false)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            await Promise.resolve()

            errorService.captureException(new Error())

            expect(sentry.captureException).not.toHaveBeenCalled()
        })

        it('should fire errors with consent', async () => {
            const getSetting = getMockPromise(true)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            await Promise.resolve()

            errorService.captureException(new Error())

            expect(sentry.captureException).toHaveBeenCalledTimes(1)
        })

        it('should start firing errors if consent is granted in the app', async () => {
            const getSetting = getMockPromise(false)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            await Promise.resolve()

            errorService.captureException(new Error())

            expect(sentry.captureException).not.toHaveBeenCalled()

            emitter.emit('gdprAllowPerformance', true)

            errorService.captureException(new Error())

            expect(sentry.captureException).toHaveBeenCalledTimes(1)
        })

        it('should stop firing errors if consent is revoked in the app', async () => {
            const getSetting = getMockPromise(true)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            await Promise.resolve()

            errorService.captureException(new Error())

            expect(sentry.captureException).toHaveBeenCalledTimes(1)

            emitter.emit('gdprAllowPerformance', false)

            errorService.captureException(new Error())

            expect(sentry.captureException).toHaveBeenCalledTimes(1)
        })

        it('should queue errors that happen while waiting to determine whether we have consent and send them if we do', async () => {
            const getSetting = getMockPromise(true)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            errorService.captureException(new Error())
            errorService.captureException(new Error())

            expect(sentry.captureException).not.toHaveBeenCalled()

            await Promise.resolve()

            expect(sentry.captureException).toHaveBeenCalledTimes(2)
        })

        it('should stop listening for events after calling destroy', async () => {
            const getSetting = getMockPromise(true)
            const emitter = createEmitter()
            const sentry = createSentry()

            const errorService = new ErrorService(
                'gdprAllowPerformance',
                getSetting,
                emitter.sub,
                sentry,
            )

            errorService.init()

            await Promise.resolve()

            errorService.captureException(new Error())

            expect(sentry.captureException).toHaveBeenCalledTimes(1)

            errorService.destroy()

            emitter.emit('gdprAllowPerformance', false)

            errorService.captureException(new Error())

            expect(sentry.captureException).toHaveBeenCalledTimes(2)
        })
    })
})
