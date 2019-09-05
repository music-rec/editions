// Based on: https://github.com/guardian/ophan/blob/master/event-model/src/main/thrift/componentevent.thrift

import { NativeModules } from 'react-native'

enum ComponentType {
    APP_BUTTON,
    APP_VIDEO,
    APP_AUDIO,
}

enum Action {
    CLICK,
    VIEW,
}

interface TrackScreen {
    screenName: string
    value?: string
}

interface TrackComponentEvent {
    componentType: string
    action: string
    value?: string
    componentId?: string
}

type UserId = string | null

const screenTrackingMapping = {
    Issue: 'issue_front',
    IssueList: 'issue_list',
    SignIn: 'sign_in',
    Settings: 'settings',
    GDPRConsent: 'consent_management_options',
    GdprConsentScreenForOnboarding: 'consent_management',
}

const setUserId = (userId: UserId): Promise<UserId> =>
    NativeModules.Ophan.setUserId(userId)

const sendAppScreenEvent = async ({
    screenName,
    value,
}: TrackScreen): Promise<boolean> =>
    NativeModules.Ophan.sendAppScreenEvent(screenName, value)

const sendComponentEvent = ({
    componentType,
    action,
    value,
    componentId,
}: TrackComponentEvent) =>
    NativeModules.Ophan.sendComponentEvent(
        componentType,
        action,
        value,
        componentId,
    )

const sendPageViewEvent = ({ path }: { path: string }) =>
    NativeModules.Ophan.sendPageViewEvent(path)

export {
    Action,
    ComponentType,
    sendAppScreenEvent,
    sendComponentEvent,
    sendPageViewEvent,
    setUserId,
    screenTrackingMapping,
}
