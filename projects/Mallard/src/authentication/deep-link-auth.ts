import { Linking, AppState } from 'react-native'
import InAppBrowser, { RedirectResult } from 'react-native-inappbrowser-reborn'

interface Emitter<T> {
    addEventListener(type: string, cb: (e: T) => void): void
    removeEventListener(type: string, cb: Function): void
}

type IAppState = Emitter<string>

const addListener = <T>(
    emitter: Emitter<T>,
    event: string,
    fn: (e: T) => void,
) => {
    emitter.addEventListener(event, fn)
    return () => emitter.removeEventListener(event, fn)
}

type ILinking = Emitter<{ url: string }> & {
    openURL: (url: string) => void
}

type IInAppBrowser = Pick<
    typeof InAppBrowser,
    'openAuth' | 'closeAuth' | 'isAvailable'
>

/**
 * This function will open an auth url and wait for the first navigation back to the app
 * if extractTokenAndValidateState returns a token then the promise will be resolved
 * otherwise the promise will reject to make sure we have removed the event listener
 * in the case where someone redirects to the app without a token and then attempts the login
 * flow again (which would have created two listeners)
 */
const authWithDeepRedirect = async (
    authUrl: string,
    deepLink: string,
    extractTokenAndValidateState: (url: string) => Promise<string>,
    /* mocks for testing */
    linkingImpl: ILinking = Linking,
    appStateImpl: IAppState = AppState,
    inAppBrowserImpl: IInAppBrowser = InAppBrowser,
): Promise<string> => {
    return new Promise(async (res, rej) => {
        const unlisteners: (() => void)[] = []

        const onFinish = async (url?: string) => {
            inAppBrowserImpl.closeAuth()
            console.log("I've finished!")

            let unlistener
            while ((unlistener = unlisteners.pop())) {
                unlistener()
            }

            if (!url) {
                rej('Sign-in cancelled')
            } else {
                try {
                    res(await extractTokenAndValidateState(url))
                } catch (e) {
                    rej(e)
                }
            }
        }

        const runExternalBrowserDeepLink = () => {
            console.log('external browser time')
            const unlistenLink = addListener(
                linkingImpl,
                'url',
                // eslint-disable-next-line
                (event: { url: string }) => onFinish(event.url),
            )

            unlisteners.push(unlistenLink)

            const unlistenAppState = addListener(
                appStateImpl,
                'change',
                (currentState: string) => {
                    if (currentState === 'active') {
                        // This is being run when
                        // make sure the link handler is removed whenever we come back to the app
                        // url is called first in the happy path so the promise will have resolved by then
                        // otherwise, if they navigate back without authenticating, remove the listener and cancel the login

                        // eslint-disable-next-line
                        onFinish()
                    }
                },
            )
            unlisteners.push(unlistenAppState)
            // open in the browser if in app browsers are not supported
            linkingImpl.openURL(authUrl)
        }

        if (!(await inAppBrowserImpl.isAvailable())) {
            runExternalBrowserDeepLink()
            return
        }
        console.log('using main route')

        // this never completes as we get stuck on https://idapi.theguardian.com/auth/apple/auth-redirect
        // probably easiest to ask Leigh-Anne to redirect to something we can use as a deep link
        // e.g. editions://authorize - the same way facebook is working at the moment
        // in the live app they are using a webview thing that allows them to intercept urls https://github.com/guardian/android-news-app/blob/ab77dbe847f99fab491df24a0fd8876470687878/android-news-app/src/main/java/com/guardian/feature/login/apple/AppleSignInWebViewClient.kt#L24
        // the default react native webview does allow this so that's an alternative option
        const result = await inAppBrowserImpl.openAuth(authUrl, deepLink, {
            // iOS Properties
            dismissButtonStyle: 'cancel',
            // Android Properties
            showTitle: false,
            enableUrlBarHiding: true,
            enableDefaultShare: true,
        })
        console.log('result finished')
        if (result.type === 'success') {
            onFinish((result as RedirectResult).url)
        } else {
            onFinish()
        }
    })
}

export { authWithDeepRedirect }
