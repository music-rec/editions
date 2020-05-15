import { authWithDeepRedirect } from '../deep-link-auth'
import qs from 'query-string'
import invariant from 'invariant'

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
