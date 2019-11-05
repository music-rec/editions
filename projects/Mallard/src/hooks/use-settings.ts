/**
 * Shorthands to get some of the settings when you only need one. Do not call
 * several of these in the same `render()` function. Instead, use `useQuery`
 * directly so that all the fetches are batched.
 */
import { isPreview } from 'src/helpers/settings/defaults'
import { useQuery, QueryStatus } from './apollo'
import gql from 'graphql-tag'

const API_URL_QUERY = gql('{ apiUrl @client }')
export const useApiUrl = () => {
    const query = useQuery<{ apiUrl: string }>(API_URL_QUERY)
    if (query.status === QueryStatus.LOADED) return query.data.apiUrl
    return null
}

export const useIsPreview = () => {
    const apiUrl = useApiUrl()
    // FIXME: upstream code should be handling the loading status
    return apiUrl != null && isPreview(apiUrl)
}

const PROD_DEV_QUERY = gql('{ isUsingProdDevtools @client }')
export const useIsUsingProdDevtools = () => {
    const query = useQuery<{ isUsingProdDevtools: boolean }>(PROD_DEV_QUERY)
    // FIXME: upstream code should be handling the loading status
    return query.status === QueryStatus.LOADED && query.data.isUsingProdDevtools
}
