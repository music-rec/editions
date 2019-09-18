import { Handler } from 'aws-lambda'
import { SNS, TemporaryCredentials } from 'aws-sdk'
import { IssueCompositeKey } from '../common'
import { attempt } from '../../backend/utils/try'

export type Status = 'Processing' | 'Published' | 'Failed'

export interface EventInput {
    issueId: IssueCompositeKey
    error?: {
        Error: string
        Cause: string
    }
    message?: string
}

export const extractError = (error?: { Cause: string }): string | undefined => {
    if (error === undefined) {
        return
    }
    try {
        const parsed = JSON.parse(error.Cause)
        return parsed.errorMessage || error.Cause
    } catch {
        return error.Cause
    }
}

export const handler: Handler<
    EventInput,
    { issueId: IssueCompositeKey }
> = async ({ issueId, message, error }) => {
    const topic = process.env.topic
    const role = process.env.role
    if (topic === undefined || role === undefined) {
        throw new Error('No topic or role.')
    }
    const sns = new SNS({
        region: 'eu-west-1',
        credentials: new TemporaryCredentials({
            RoleArn: role,
            RoleSessionName: 'front-assume-role-access-for-sns',
        }),
    })

    const status: Status = error === undefined ? 'Published' : 'Failed'

    const parsedErrorOrMessage = extractError(error) || message

    const payload = {
        event: {
            ...issueId,
            status,
            message: parsedErrorOrMessage,
        },
    }
    const send = await attempt(
        sns
            .publish({ TopicArn: topic, Message: JSON.stringify(payload) })
            .promise(),
    )

    console.log(send)
    return { issueId }
}
