import {
    membershipAccessTokenKeychain,
    userAccessTokenKeychain,
} from './keychain'
import { fetchMembershipData } from 'src/services/membership-service'
import {
    fetchMembershipAccessToken,
    fetchUserAccessTokenWithIdentity,
    fetchUserAccessTokenWithType,
    TokenType,
} from 'src/services/id-service'

const fetchAndPersistUserAccessTokenWithIdentity = async (
    email: string,
    password: string,
) => {
    const token = await fetchUserAccessTokenWithIdentity(email, password)
    await userAccessTokenKeychain.set(email, token)
    return token
}

const fetchAndPersistUserAccessTokenWithType = async (
    tokenType: TokenType,
    authToken: string,
): Promise<string> => {
    const token = await fetchUserAccessTokenWithType(tokenType, authToken)
    await userAccessTokenKeychain.set(`token::${tokenType}`, token)
    return token
}

const fetchMembershipDataForKeychainUser = async (
    membershipTokenStore = membershipAccessTokenKeychain,
    userTokenStore = userAccessTokenKeychain,
    fetchMembershipDataImpl = fetchMembershipData,
    fetchMembershipAccessTokenImpl = fetchMembershipAccessToken,
) => {
    const membershipToken = await membershipTokenStore.get()
    if (membershipToken)
        return fetchMembershipDataImpl(membershipToken.password)

    // no cached membership token, try and get the userToken so we can generate a new membership token
    const userToken = await userTokenStore.get()
    if (!userToken) {
        // no userToken - we need to be logged in again
        return null
    }
    const newMembershipToken = await fetchMembershipAccessTokenImpl(
        userToken.password,
    )
    // cache the new token
    membershipTokenStore.set(userToken.username, newMembershipToken)
    return fetchMembershipDataImpl(newMembershipToken)
}

export {
    fetchAndPersistUserAccessTokenWithIdentity,
    fetchAndPersistUserAccessTokenWithType,
    fetchMembershipDataForKeychainUser,
}
