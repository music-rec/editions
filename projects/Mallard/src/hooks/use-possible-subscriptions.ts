import RNIAP from 'react-native-iap'
import { useState, useEffect } from 'react'
import { Platform } from 'react-native'

const SUBS = {
    ios: ['uk.co.guardian.gce.test_subscription'],
    android: ['uk.co.guardian.gce.test_subscription'],
}

const getPlatformSubs = () => {
    switch (Platform.OS) {
        case 'ios': {
            return SUBS.ios
        }
        case 'android': {
            return SUBS.android
        }
        default: {
            return []
        }
    }
}

const usePossibleSubscriptions = () => {
    const [subscriptions, setSubcriptions] = useState<{
        [key: string]: RNIAP.Subscription<string>
    } | null>(null)

    useEffect(() => {
        const subs = getPlatformSubs()
        RNIAP.getSubscriptions(subs).then(subs =>
            setSubcriptions(
                subs.reduce(
                    (acc, sub) => ((acc[sub.productId] = sub), acc),
                    ({} as unknown) as {
                        [key: string]: RNIAP.Subscription<string>
                    },
                ),
            ),
        )
    }, [])

    return subscriptions
}

export { usePossibleSubscriptions, SUBS }
