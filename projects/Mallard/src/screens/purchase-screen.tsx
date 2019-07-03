import React, { useEffect, useState, useCallback, useRef } from 'react'
import RNIAP, {
    purchaseUpdatedListener,
    purchaseErrorListener,
    ProductPurchase,
    PurchaseError,
} from 'react-native-iap'
import { Text, EmitterSubscription } from 'react-native'

const PurchaseScreen = () => {
    const [hasInitialised, setHasInitialised] = useState(false)

    const purchaseUpdateSubscription = useRef<EmitterSubscription | null>(null)
    const purchaseErrorSubscription = useRef<EmitterSubscription | null>(null)

    useEffect(() => {
        RNIAP.getSubscriptions(['uk.co.guardian.gce.test_subscription']).then(
            console.log,
        )
        RNIAP.getPurchaseHistory().then(console.log)
        RNIAP.initConnection().then(() => {
            purchaseUpdateSubscription.current = purchaseUpdatedListener(
                (purchase: ProductPurchase) => {
                    console.log(purchase)
                },
            )
            purchaseErrorSubscription.current = purchaseErrorListener(
                (error: PurchaseError) => {
                    console.log(error)
                },
            )
            setHasInitialised(true)
        })

        return () => {
            const updateListener = purchaseUpdateSubscription.current
            updateListener && updateListener.remove()
            const errorListener = purchaseErrorSubscription.current
            errorListener && errorListener.remove()
        }
    }, [])

    const handlePress = useCallback(() => {
        try {
            RNIAP.requestPurchase('uk.co.guardian.gce.test_subscription')
        } catch (err) {
            console.warn(err.code, err.message)
        }
    }, [])

    return <Text onPress={handlePress}>{hasInitialised.toString()}</Text>
}

export { PurchaseScreen }
