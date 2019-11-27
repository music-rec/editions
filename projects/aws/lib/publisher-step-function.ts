import * as iam from '@aws-cdk/aws-iam'
import * as sfn from '@aws-cdk/aws-stepfunctions'
import * as cdk from '@aws-cdk/core'
import { Duration } from '@aws-cdk/core'
import { StepFunctionProps, task } from './constructs'

export const publisherStepFunction = (
    scope: cdk.Construct,
    {
        stack,
        stage,
        deployBucket,
        outputBucket,
        backendURL,
        frontsTopicArn,
        frontsTopicRoleArn,
        guNotifyServiceApiKey,
    }: StepFunctionProps,
) => {
    const frontsTopicRole = iam.Role.fromRoleArn(
        scope,
        'fronts-topic-role-publisher',
        frontsTopicRoleArn,
    )

    const lambdaParams = {
        stack,
        stage,
        deployBucket,
        outputBucket,
        frontsTopicArn,
        frontsTopicRole,
    }
    //Publisher step function
    const issue = task(scope, 'publish', 'Fetch Issue', lambdaParams, {
        backend: backendURL,
    })

    const notification = task(
        scope,
        'publishNotification',
        'Schedule device notification',
        lambdaParams,
        {
            gu_notify_service_api_key: guNotifyServiceApiKey,
        },
    )

    issue.task.next(notification.task)

    const publisherStateMachine = new sfn.StateMachine(
        scope,
        'Publisher State Machine',
        {
            stateMachineName: `Editions-Publisher-State-Machine-${stage}`,
            definition: issue.task,
            timeout: Duration.minutes(10),
        },
    )


    return publisherStateMachine
}
