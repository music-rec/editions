import {
    onSettingChanged,
    getSetting,
    GdprSwitchSettings,
} from 'src/helpers/settings'
import Sentry from 'react-native-sentry'
import Config from 'react-native-config'

const { SENTRY_DSN_URL } = Config

const DEFAULT_SETTING_KEY = 'gdprAllowPerformance' as const

interface SentryImpl {
    config: (
        dsn: string,
        options?: object,
    ) => {
        install: () => Promise<void>
    }
    captureException: (err: Error) => void
}

enum InitState {
    unitialized,
    initializing,
    initialized,
}

class ErrorService {
    private settingKey: keyof GdprSwitchSettings
    private hasConsent: boolean
    private hasConfigured: boolean
    private initState: InitState
    private initQueue: Error[]
    private getSettingImpl: typeof getSetting
    private onSettingChangedImpl: typeof onSettingChanged
    private sentryImpl: SentryImpl
    private deregisterSettingListener: () => void

    constructor(
        settingKey: keyof GdprSwitchSettings = DEFAULT_SETTING_KEY,
        getSettingImpl = getSetting,
        onSettingChangedImpl = onSettingChanged,
        sentryImpl: SentryImpl = Sentry,
    ) {
        this.settingKey = settingKey
        this.hasConsent = false
        this.initState = InitState.unitialized
        this.hasConfigured = false
        this.initQueue = []
        this.getSettingImpl = getSettingImpl
        this.onSettingChangedImpl = onSettingChangedImpl
        this.sentryImpl = sentryImpl
        this.deregisterSettingListener = () => {}
    }

    public async init() {
        this.initState = InitState.initializing
        this.addSettingListener()
        this.handleConsentUpdate(!!(await this.getSettingImpl(this.settingKey)))
        this.initState = InitState.initialized
        this.processInitQueue()
        return this
    }

    private handleConsentUpdate(hasConsent: boolean) {
        this.hasConsent = hasConsent
        if (this.hasConsent && !this.hasConfigured) {
            this.sentryImpl.config(SENTRY_DSN_URL).install()
            this.hasConfigured = true
        }
    }

    private addSettingListener() {
        this.deregisterSettingListener = this.onSettingChangedImpl(
            (key, value) => {
                if (key === this.settingKey) {
                    this.handleConsentUpdate(!!value)
                }
            },
        )
    }

    private processInitQueue() {
        if (this.hasConsent) {
            // if we do have consent send all the errors to sentry
            while (this.initQueue.length) {
                const err = this.initQueue.pop()
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.sentryImpl.captureException(err!)
            }
        } else {
            // if we don't have consent then ignore all errors
            this.initQueue = []
        }
    }

    public captureException(err: Error) {
        switch (this.initState) {
            case InitState.initialized: {
                if (this.hasConsent) {
                    this.sentryImpl.captureException(err)
                }
                break
            }
            case InitState.initializing: {
                this.initQueue.push(err)
                break
            }
            default: {
                break
            }
        }
    }

    public destroy() {
        this.deregisterSettingListener()
    }
}

const singletonErrorService = new ErrorService()

export { singletonErrorService as errorService, ErrorService }
