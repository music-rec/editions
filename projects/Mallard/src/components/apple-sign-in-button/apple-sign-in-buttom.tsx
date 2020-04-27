import {
    AppleAuthenticationCredential,
    AppleAuthenticationScope,
    signInAsync,
} from 'expo-apple-authentication'
import { AppleCreds } from 'src/authentication/authorizers/IdentityAuthorizer'

// TODO: if authorizationCode or idToken are null we should give up here and give some useful error
// rather than using an empty string
const mapCredentials = (
    appleCredentials: AppleAuthenticationCredential,
): AppleCreds => {
    const { identityToken, authorizationCode, fullName } = appleCredentials
    const givenName = fullName ? fullName.givenName : ''
    const familyName = fullName ? fullName.familyName : ''

    return {
        authorizationCode: authorizationCode || '',
        givenName: givenName || '',
        familyName: familyName || '',
        idToken: identityToken || '',
    }
}

export const appleAuth = (): Promise<AppleCreds> => {
    return signInAsync({
        requestedScopes: [
            AppleAuthenticationScope.FULL_NAME,
            AppleAuthenticationScope.EMAIL,
        ],
    }).then(mapCredentials)
    // TODO: maybe we need some error handling here in the case where sign in fails
}
