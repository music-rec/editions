import React, { useEffect, useState, useCallback, useRef } from 'react'
import RNIAP, {
    purchaseUpdatedListener,
    purchaseErrorListener,
    ProductPurchase,
    PurchaseError,
} from 'react-native-iap'
import { EmitterSubscription } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { List } from 'src/components/lists/list'
import { Heading } from 'src/components/layout/ui/row'

const SUBS = ['uk.co.guardian.gce.test_subscription']
const ITUNES_CONNECT_SHARED_SECRET = '...'

interface Receipt {
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

const findOngoingSubFromReceipt = async (receipt: string) => {
    const latestReceipt = await RNIAP.validateReceiptIos(
        {
            'receipt-data': receipt,
            password: ITUNES_CONNECT_SHARED_SECRET,
        },
        __DEV__,
    )

    if (!latestReceipt) throw new Error('Could not find receipt for purchase')
    const latestReceiptInfo = latestReceipt.latest_receipt_info as Receipt[]
    if (!latestReceiptInfo)
        throw new Error('Could not find receipt info for receipt')

    return (
        latestReceiptInfo.find(receipt => {
            const expirationInMilliseconds = Number(receipt.expires_date_ms)
            const nowInMilliseconds = Date.now()
            return expirationInMilliseconds > nowInMilliseconds
        }) || false
    )
}

// Can't purchase multiple subscriptions inside the same Family (Apple will block this)
// https://stackoverflow.com/questions/7086612/in-app-purchase-multiple-auto-renewing-subscriptions-having-different-durations

const getCurrentLatestReceipt = async ({
    onSubscriptionTypes,
}: {
    onSubscriptionTypes: (subs: RNIAP.Subscription<string>[]) => void
}) => {
    const [possibleSubs, purchaseHistory] = await Promise.all([
        RNIAP.getSubscriptions(SUBS),
        RNIAP.getAvailablePurchases(),
    ])

    onSubscriptionTypes(possibleSubs)

    const latestTransaction = purchaseHistory.sort(
        (a, b) => b.transactionDate - a.transactionDate,
    )[0]

    return latestTransaction
        ? findOngoingSubFromReceipt(latestTransaction.transactionReceipt)
        : false
}

const PurchaseScreen = () => {
    const [ongoingSub, setOngoingSub] = useState<Receipt | false | null>(null)
    const [subscriptions, setSubcriptions] = useState<{
        [key: string]: RNIAP.Subscription<string>
    }>({})

    const purchaseUpdateSubscription = useRef<EmitterSubscription | null>(null)
    const purchaseErrorSubscription = useRef<EmitterSubscription | null>(null)

    useEffect(() => {
        RNIAP.initConnection().then(() => {
            purchaseUpdateSubscription.current = purchaseUpdatedListener(
                (purchase: ProductPurchase) => {
                    findOngoingSubFromReceipt(purchase.transactionReceipt).then(
                        setOngoingSub,
                    )
                },
            )
            purchaseErrorSubscription.current = purchaseErrorListener(
                (error: PurchaseError) => {
                    console.log(error)
                },
            )

            getCurrentLatestReceipt({
                onSubscriptionTypes: subs => {
                    // batch these
                    setSubcriptions(
                        subs.reduce(
                            (acc, sub) => ((acc[sub.productId] = sub), acc),
                            ({} as unknown) as {
                                [key: string]: RNIAP.Subscription<string>
                            },
                        ),
                    )
                },
            }).then(setOngoingSub)
        })

        return () => {
            const updateListener = purchaseUpdateSubscription.current
            updateListener && updateListener.remove()
            const errorListener = purchaseErrorSubscription.current
            errorListener && errorListener.remove()
        }
    }, [])

    const handlePress = useCallback((productId: string) => {
        try {
            RNIAP.requestPurchase(productId)
        } catch (err) {
            console.warn(err.code, err.message)
        }
    }, [])

    return (
        <ScrollView style={{ flex: 1 }}>
            <Heading>
                {`Purchased subs ${
                    ongoingSub === null
                        ? 'Loading ...'
                        : ongoingSub === false
                        ? '(0)'
                        : '(1)'
                }`}
            </Heading>
            <List
                onPress={() => {}}
                data={
                    ongoingSub
                        ? [
                              {
                                  key: ongoingSub.original_transaction_id,
                                  title:
                                      (
                                          subscriptions[
                                              ongoingSub.product_id
                                          ] || {}
                                      ).title || ongoingSub.product_id,
                                  explainer: `Will renew on ${ongoingSub.expires_date}`,
                              },
                          ]
                        : []
                }
            ></List>
            <Heading>Available subs</Heading>
            <List
                onPress={handlePress}
                data={
                    ongoingSub === false
                        ? Object.values(subscriptions).map(sub => ({
                              key: sub.productId,
                              title: sub.title,
                              explainer: sub.price,
                              data: sub.productId,
                          }))
                        : []
                }
            ></List>
        </ScrollView>
    )
}

export { PurchaseScreen }
