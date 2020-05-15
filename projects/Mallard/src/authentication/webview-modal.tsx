import React from 'react'
import { Modal, View } from 'react-native'
import WebView from 'react-native-webview'
import { AuthParams } from './authorizers/IdentityAuthorizer'

export const WebviewModal = ({
    url,
    visible,
    onAppleComplete,
}: {
    url: string
    visible: boolean
    onAppleComplete: (token: AuthParams) => void
}) => {
    return (
        <Modal visible={visible}>
            <View>
                <WebView
                    source={{ uri: url }}
                    onNavigationStateChange={newState => {
                        const { url } = newState
                        console.log('Webview url change:', url)
                        if (url.includes('apple-sign-in-token')) {
                            const token = url.split('=')[1]
                            onAppleComplete({ 'apple-sign-in-token': token })
                        }
                    }}
                />
            </View>
        </Modal>
    )
}
