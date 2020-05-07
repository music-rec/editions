import { authWithDeepRedirect } from '../deep-link-auth'
import qs from 'query-string'
import invariant from 'invariant'

const appleRedirectURI =
    'https://idapi.theguardian.com/auth/apple/auth-redirect'

const getAppleOAuthURL = (validatorString: string) =>
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

/**
 * Attempts to login with apple OAuth
 *
 * Due to its dependency on `authWithDeepRedirect` it expects that auth to be completed
 * with a deep link back into the app. The `invariant` calls will throw if they fail.
 *
 * They have been written here with strings that currently are ok to show in the UI.
 */
const appleAuthWithDeepRedirect = (
    validatorString: string,
): Promise<string> => {
    console.log('doing apple auth', getAppleOAuthURL(validatorString))
    return authWithDeepRedirect(
        getAppleOAuthURL(validatorString),
        appleRedirectURI,
        async url => {
            // this code never gets called at the moment because we get stuck in the webview
            console.log('Validating!')
            invariant(url.startsWith(appleRedirectURI), 'Sign-in cancelled')

            const params = qs.parse(url.split('?')[1])

            invariant(
                params.state === validatorString,
                'Sign-in session expired, please try again',
            )

            invariant(params['apple-sign-in-token'], 'Something went wrong')

            console.log('apple! ', params['apple-sign-in-token'])
            return params['apple-sign-in-token'] as string
        },
    )
}

export { appleAuthWithDeepRedirect }
