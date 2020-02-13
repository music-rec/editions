import React, { useState, useEffect } from 'react'
import { Animated, StyleSheet, View, Easing } from 'react-native'
import { color } from 'src/theme/color'
import { metrics } from 'src/theme/spacing'
import { SliderSection } from './types'
import { ISliderTitle, SliderTitle } from './SliderTitle'
import { supportsAnimation } from 'src/helpers/features'
import { ANDROID_HEADER_HEIGHT } from './SliderHeaderLowEnd'

const styles = StyleSheet.create({
    slider: {
        paddingVertical: metrics.vertical,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: color.line,
        backgroundColor: color.background,
        paddingHorizontal: metrics.horizontal,
    },
    sliderAtTop: {
        borderBottomColor: color.background,
    },
    androidHeader: {
        position: 'absolute',
        height: ANDROID_HEADER_HEIGHT,
        left: 0,
        right: 0,
    },
})

const SliderHeaderHighEnd = ({
    isShown,
    isAtTop,
    panResponder,
    sliderDetails,
}: {
    isShown: boolean
    isAtTop: boolean
    panResponder: any
    sliderDetails: ISliderTitle
}) => {
    const [top] = useState(new Animated.Value(0))
    if (supportsAnimation()) {
        useEffect(() => {
            if (isShown) {
                Animated.timing(top, {
                    toValue: 0,
                    easing: Easing.out(Easing.ease),
                    duration: 200,
                }).start()
            } else {
                Animated.timing(top, {
                    toValue: -80,
                    easing: Easing.out(Easing.ease),
                    duration: 200,
                }).start()
            }
        }, [isShown, top])
    }
    return (
        <Animated.View style={[styles.androidHeader, { top }]}>
            <View
                style={[styles.slider, isAtTop ? styles.sliderAtTop : null]}
                {...panResponder.panHandlers}
            >
                <SliderTitle {...sliderDetails} />
            </View>
        </Animated.View>
    )
}

export { SliderHeaderHighEnd }
