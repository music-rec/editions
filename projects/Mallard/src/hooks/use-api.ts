import { IssueSummary } from 'src/common'
import { withResponse } from 'src/helpers/response'
import { useCachedOrPromise } from './use-cached-or-promise'
import { useNetInfo } from './use-net-info'
import { readIssueSummary, storeIssueSummary } from 'src/helpers/files'

export const getIssueSummary = () => {
    const { isConnected } = useNetInfo()

    return {
        type: 'promise',
        getValue: isConnected ? storeIssueSummary : readIssueSummary,
    }
}

export const useIssueSummary = () => {
    const response = useCachedOrPromise(getIssueSummary())
    return {
        response: withResponse<IssueSummary[]>(response),
        retry: response.retry,
    }
}
