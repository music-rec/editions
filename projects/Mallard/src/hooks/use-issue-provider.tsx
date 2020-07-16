import React, { createContext, useState, useContext } from 'react'

import { IssueWithFronts } from '../../../Apps/common/src'
import { fetchIssue2 } from 'src/helpers/fetch'
import { PathToIssue } from 'src/paths'
import { useIsPreview } from 'src/hooks/use-settings'
export const DEFAULT_ISSUE: IssueWithFronts = {
    fronts: [],
    origin: 'api',
    name: 'default',
    date: 'defaultdate',
    publishedId: '',
    localId: '',
    key: '',
}

interface IssueState {
    issue: IssueWithFronts
    status: IssueStatus
    errorMessage: string
    getIssue: (path: PathToIssue, forceApiFetch: boolean) => void
}

type IssueStatus = 'ready' | 'pending' | 'error'

const defaultContext: IssueState = {
    issue: DEFAULT_ISSUE,
    status: 'pending',
    errorMessage: '',
    getIssue: (path: PathToIssue, forceApiFetch: boolean) => {},
}

const IssueContext = createContext(defaultContext)

export const IssueProvider = ({ children }: { children: React.ReactNode }) => {
    const [issue, setIssue] = useState<IssueWithFronts>(DEFAULT_ISSUE)
    const [status, setStatus] = useState<IssueStatus>('pending')
    const [errorMessage, setErrorMessage] = useState('')

    const getIssue = async (path: PathToIssue, forceApiFetch: boolean) => {
        if (
            issue.publishedId !== path.publishedIssueId ||
            issue.localId !== path.localIssueId
        ) {
            // setStatus('pending')
            try {
                const requestedIssue = await fetchIssue2(
                    path.localIssueId,
                    path.publishedIssueId,
                    forceApiFetch,
                )
                if (requestedIssue.publishedId !== issue.publishedId) {
                    setIssue(requestedIssue)
                }
                setStatus('ready')
                setErrorMessage('')
            } catch (e) {
                setErrorMessage(e.message)
                setStatus('error')
            }
        }
    }
    return (
        <IssueContext.Provider
            value={{
                issue,
                status,
                errorMessage,
                getIssue,
            }}
        >
            {children}
        </IssueContext.Provider>
    )
}

export const useIssue = () => useContext(IssueContext)
