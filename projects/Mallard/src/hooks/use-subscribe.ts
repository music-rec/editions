import { useEffect, useState, useCallback, useRef } from 'react'
import RNIAP, {
    purchaseUpdatedListener,
    purchaseErrorListener,
    ProductPurchase,
    PurchaseError,
    acknowledgePurchaseAndroid,
    Purchase,
} from 'react-native-iap'
import { EmitterSubscription, Platform } from 'react-native'
import { SUBS } from './use-possible-subscriptions'

const ITUNES_CONNECT_SHARED_SECRET = '4dd7cd6a9c6b4700b125f1ba446429df'

export interface ReceiptIOS {
    expires_date: string
    expires_date_ms: string
    expires_date_pst: string
    is_in_intro_offer_period: string
    is_trial_period: string
    original_purchase_date: string
    original_purchase_date_ms: string
    original_purchase_date_pst: string
    original_transaction_id: string
    product_id: string
    purchase_date: string
    purchase_date_ms: string
    purchase_date_pst: string
    quantity: string
    transaction_id: string
    web_order_line_item_id: string
}

// TODO: may need to do this on the server as currently this can't be done serverless on Android
const findCurrentReceiptFromPurchaseHistoryIOS = async (
    purchases: Purchase[],
) => {
    const purchase = purchases.sort(
        (a, b) => b.transactionDate - a.transactionDate,
    )[0]

    if (!purchase) return false

    const latestReceipt = await RNIAP.validateReceiptIos(
        {
            'receipt-data': purchase.transactionReceipt,
            password: ITUNES_CONNECT_SHARED_SECRET,
        },
        __DEV__,
    )

    if (!latestReceipt) throw new Error('Could not find receipt for purchase')
    const latestReceiptInfo = latestReceipt.latest_receipt_info as ReceiptIOS[]
    if (!latestReceiptInfo)
        throw new Error('Could not find receipt info for receipt')

    return (
        latestReceiptInfo.find(
            receipt => Number(receipt.expires_date_ms) > Date.now(),
        ) || false
    )
}

const findCurrentPurchaseFromPurchaseHistoryAndroid = (
    purchases: RNIAP.Purchase[],
): Purchase | false => {
    const purchase = purchases.find(purchase =>
        SUBS.android.includes(purchase.productId),
    )
    return purchase || false
}

type InfoIOS = ReceiptIOS & {
    type: 'ios'
}

type InfoAndroid = Purchase & {
    type: 'android'
}

export type CurrentPurchaseInfo = InfoIOS | InfoAndroid

const findCurrentSubInfoFromPurchases = async (
    purchases: RNIAP.Purchase[],
): Promise<CurrentPurchaseInfo | false> => {
    switch (Platform.OS) {
        case 'ios': {
            const receipt = await findCurrentReceiptFromPurchaseHistoryIOS(
                purchases,
            )
            return (
                receipt && {
                    ...receipt,
                    type: 'ios',
                }
            )
        }
        case 'android': {
            const purchase = findCurrentPurchaseFromPurchaseHistoryAndroid(
                purchases,
            )
            return (
                purchase && {
                    ...purchase,
                    type: 'android',
                }
            )
        }
        default: {
            return false
        }
    }
}

// Can't purchase multiple subscriptions inside the same Family on Apple (Apple will block this)
// https://stackoverflow.com/questions/7086612/in-app-purchase-multiple-auto-renewing-subscriptions-having-different-durations
// TBD about Android

const requiresAcknowledging = (purchase: ProductPurchase) =>
    purchase.purchaseStateAndroid === 1 && !purchase.isAcknowledgedAndroid

const maybeAcknowledgePurchaseAndroid = async (purchase: ProductPurchase) => {
    if (requiresAcknowledging(purchase)) {
        try {
            // TODO check the response!
            return !!(await acknowledgePurchaseAndroid(
                purchase.purchaseToken || '', // if it's not set then set to empty string which will fail
            ))
        } catch (ackErr) {
            console.warn('ackErr', ackErr)
            return false
        }
    }
    return true
}

const useSubscribe = ({
    onPurchase = () => {},
    onWarning = () => {},
    onError = () => {},
}: {
    onPurchase?: (newSubscription: CurrentPurchaseInfo | false) => void
    onWarning?: (warning: string) => void
    onError?: (newSubscription: PurchaseError) => void
} = {}): [
    CurrentPurchaseInfo | false | null,
    ((productId: string) => void),
] => {
    const [currentSub, setCurrentSubscriptionInfo] = useState<
        CurrentPurchaseInfo | false | null
    >(null)
    const purchaseUpdateSubscription = useRef<EmitterSubscription | null>(null)
    const purchaseErrorSubscription = useRef<EmitterSubscription | null>(null)

    useEffect(() => {
        RNIAP.initConnection().then(() =>
            RNIAP.getAvailablePurchases()
                .then(findCurrentSubInfoFromPurchases)
                .then(setCurrentSubscriptionInfo),
        )
        return () => {
            // https://github.com/dooboolab/react-native-iap#end-billing-connection
            RNIAP.endConnectionAndroid()
        }
    }, [])

    useEffect(() => {
        purchaseUpdateSubscription.current = purchaseUpdatedListener(
            async (purchase: ProductPurchase) => {
                const info = await findCurrentSubInfoFromPurchases([purchase])

                // This is not a requirement on iOS
                const wasAcknowledged = await maybeAcknowledgePurchaseAndroid(
                    purchase,
                )

                if (!wasAcknowledged) {
                    // TODO: what do we do in this case? the purchase has still gone through but will
                    // be cancelled in a few days
                    onWarning('Purchase was not acknowledged')
                }

                setCurrentSubscriptionInfo(info)
                onPurchase(info)
            },
        )
        purchaseErrorSubscription.current = purchaseErrorListener(onError)

        return () => {
            const updateListener = purchaseUpdateSubscription.current
            updateListener && updateListener.remove()
            const errorListener = purchaseErrorSubscription.current
            errorListener && errorListener.remove()
        }
    }, [onPurchase, onWarning, onError])

    const subscribeToSKU = useCallback((productId: string) => {
        try {
            RNIAP.requestPurchase(productId)
        } catch (err) {
            console.warn(err.code, err.message)
        }
    }, [])

    return [currentSub, currentSub ? () => {} : subscribeToSKU]
}

export { useSubscribe }
