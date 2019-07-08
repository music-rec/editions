import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { List } from 'src/components/lists/list'
import { Heading } from 'src/components/layout/ui/row'
import { usePossibleSubscriptions } from 'src/hooks/use-possible-subscriptions'
import { useSubscribe, CurrentPurchaseInfo } from 'src/hooks/use-subscribe'
import { Subscription } from 'react-native-iap'

const createCurrentSubData = (
    currentSub: CurrentPurchaseInfo,
    subs: {
        [key: string]: Subscription<string>
    },
) =>
    currentSub.type === 'android'
        ? {
              key:
                  currentSub.transactionId ||
                  currentSub.transactionDate.toString(),
              title:
                  (subs[currentSub.productId] || {}).title ||
                  currentSub.productId,
              explainer: currentSub.autoRenewingAndroid
                  ? 'Currently set to auto renew'
                  : 'This will not renew',
          }
        : {
              key: currentSub.original_transaction_id,
              title:
                  (subs[currentSub.product_id] || {}).title ||
                  currentSub.product_id,
              explainer: `Will renew on ${currentSub.expires_date}`,
          }

const createAvailableSubsData = (sub: Subscription<string>) => ({
    key: sub.productId,
    title: sub.title,
    explainer: sub.price,
    data: sub.productId,
})

const PurchaseScreen = () => {
    const subscriptions = usePossibleSubscriptions()
    const [currentSub, subDispatcher] = useSubscribe()

    return (
        <ScrollView style={{ flex: 1 }}>
            <Heading>
                {`Purchased subs ${
                    currentSub === null
                        ? 'Loading ...'
                        : currentSub === false
                        ? '(0)'
                        : '(1)'
                }`}
            </Heading>
            <List
                onPress={() => {}}
                data={
                    currentSub && subscriptions
                        ? [createCurrentSubData(currentSub, subscriptions)]
                        : []
                }
            ></List>
            <Heading>Available subs</Heading>
            <List
                onPress={subDispatcher}
                data={
                    currentSub === false && subscriptions
                        ? Object.values(subscriptions).map(
                              createAvailableSubsData,
                          )
                        : []
                }
            ></List>
        </ScrollView>
    )
}

export { PurchaseScreen }
