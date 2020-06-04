import React from 'react'
import { Image, StyleSheet, Animated } from 'react-native'
import { Image as IImage } from '../../../../Apps/common/src'
import { useImagePath } from 'src/hooks/use-image-paths'
import { PinchGestureHandler } from 'react-native-gesture-handler'
import { transform } from '@babel/core'

const styles = StyleSheet.create({
    image: {
        alignSelf: 'center',
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
    },
})

const LightboxImage = ({ image }: { image: IImage }) => {
    const scale = React.useRef(new Animated.Value(1)).current
    const imagePath = useImagePath(image, 'full-size')
    const handlePinch = Animated.event([{ nativeEvent: { scale } }])
    return (
        <PinchGestureHandler onGestureEvent={handlePinch}>
            <Animated.Image
                style={[styles.image, { transform: [{ scale }] }]}
                source={{
                    uri: imagePath,
                }}
            />
        </PinchGestureHandler>
    )
}

export { LightboxImage }
