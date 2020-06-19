import { OnboardingCard, CardAppearance } from './onboarding/onboarding-card'
import React from 'react'
import { View, Platform, Linking, StyleSheet, Alert } from 'react-native'
import { ModalButton } from './Button/ModalButton'
import { ModalOpener } from './login/login-overlay'

export const AppRateOverlayOverlay = ({
    children,
    isFocused,
    onDismiss,
    onOpenCASLogin,
    onLoginPress,
}: {
    children: React.ReactNode
    isFocused: () => boolean
    onDismiss: () => void
    onOpenCASLogin: () => void
    onLoginPress: () => void
}) => {
    return (
        <ModalOpener
            isFocused={isFocused}
            renderModal={close => (
                <AppRateModalCard
                    onDismiss={onDismiss}
                    onOpenCASLogin={onOpenCASLogin}
                    onLoginPress={onLoginPress}
                    close={close}
                />
            )}
        >
            {children}
        </ModalOpener>
    )
}

const AppRateModalCard = ({
    close,
    onOpenCASLogin,
    onLoginPress,
    onDismiss,
}: {
    close: () => void
    onOpenCASLogin: () => void
    onLoginPress: () => void
    onDismiss: () => void
}) => (
    <OnboardingCard
        title="Enjoying the app?"
        subtitle="Please rate us in the google Play Store"
        appearance={CardAppearance.blue}
        size="medium"
        onDismissThisCard={() => {
            close()
            onDismiss()
        }}
        bottomContent={
            <>
                <View style={styles.bottomContentContainer}>
                    <ModalButton
                        onPress={() => {
                            if (Platform.OS != 'ios') {
                                //To open the Google Play Store
                                Linking.openURL(
                                    `market://details?id=com.guardian.editions`,
                                ).catch(err =>
                                    Alert.alert(
                                        'Please check for the Google Play Store',
                                    ),
                                )
                            } else {
                                //To open the Apple App Store
                                Linking.openURL(
                                    'itms://itunes.apple.com/in/app/apple-store/id452707806',
                                ).catch(err =>
                                    Alert.alert(
                                        'Please check for the App Store',
                                    ),
                                )
                            }
                        }}
                    >
                        Rate the App
                    </ModalButton>
                </View>
            </>
        }
    />
)

const styles = StyleSheet.create({
    bottomContentContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexGrow: 1,
        marginRight: 15,
    },
})
