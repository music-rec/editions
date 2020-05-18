import qs from 'query-string'
import { authWithDeepRedirect } from '../deep-link-auth'

const appleRedirectURI =
    'https://idapi.theguardian.com/auth/apple/auth-redirect'

export const getAppleOAuthURL = (validatorString: string) =>
    `https://appleid.apple.com/auth/authorize?${qs.stringify(
        {
            client_id: 'com.theguardian.editions',
            response_type: 'code id_token',
            redirect_uri: appleRedirectURI,
            // I think these are the two scopes required by identity and are what the apps use
            scope: ['name', 'email'].join(' '),
            // always re-authenticate when clicking the fb login button
            // seeing it means the user will have logged out
            // this will help prevent CSRF
            state: validatorString,
            response_mode: 'form_post',
        },
        { encode: true },
    )}`

// this is the react-native-inappbrowser-reborn implementation which doesn't work at the moment
// if we go down the webview route we can remove everything below this line!
const appleAuthWithDeepRedirect = (validatorString: string): Promise<string> =>
    authWithDeepRedirect(
        getAppleOAuthURL(validatorString),
        appleRedirectURI,
        async url => {
            console.log('FINISHED SIGN IN ', url)
            // invariant(url.startsWith(facebookRedirectURI), 'Sign-in cancelled')

            // const params = qs.parse(url.split('#')[1])

            // invariant(
            //     params.state === validatorString,
            //     'Sign-in session expired, please try again',
            // )

            // invariant(params.access_token, 'Something went wrong')

            return 'token should go here'
        },
    )

export { appleAuthWithDeepRedirect }
