import React from 'react'
import { Animated, Platform, StyleSheet, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {
    useLargeDeviceMemory,
    useDimensions,
    useDotsAllowed,
} from 'src/hooks/use-config-provider'
import { metrics } from 'src/theme/spacing'

interface SliderDotsProps {
    numOfItems: number
    color: string
    location?: 'article' | 'front'
    position: Animated.AnimatedInterpolation
    startIndex?: number
}

const DOT_ARTICLE_WIDTH = 8
const DOT_ARTICLE_MARGIN = 2

const styles = (color: string, location: string, isTablet: boolean) => {
    const dotBuilder = (size: number, marginRight: number) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        marginRight,
    })

    const dotFront = isTablet ? dotBuilder(14, 7) : dotBuilder(10, 4)

    const dotArticle = dotBuilder(DOT_ARTICLE_WIDTH, DOT_ARTICLE_MARGIN)

    const dot = location === 'article' ? dotArticle : dotFront

    return StyleSheet.create({
        dotsContainer: {
            flexDirection: 'row',
            paddingTop: metrics.vertical,
        },
        dot,
        selected: {
            backgroundColor: color,
        },
    })
}

const SliderDots = React.memo(
    ({
        numOfItems,
        color,
        location = 'article',
        position,
        startIndex,
    }: SliderDotsProps) => {
        const dots = []
        const isTablet = DeviceInfo.isTablet()
        const appliedStyle = styles(color, location, isTablet)
        const dotsAllowed = useDotsAllowed()

        const newPos: any =
            Platform.OS === 'android' && startIndex
                ? Number(position) - startIndex
                : startIndex
                ? Animated.subtract(position, startIndex)
                : position

        const largeDeviceMemory = useLargeDeviceMemory()
        const range = (i: number) =>
            largeDeviceMemory
                ? {
                      inputRange: [
                          i - 0.50000000001,
                          i - 0.5,
                          i,
                          i + 0.5,
                          i + 0.50000000001,
                      ],
                      outputRange: ['#DCDCDC', color, color, color, '#DCDCDC'],
                  }
                : {
                      inputRange: [i - 1, i, i + 1],
                      outputRange: ['#DCDCDC', color, '#DCDCDC'],
                  }

        for (let i = 0; i < numOfItems; i++) {
            const backgroundColor =
                Platform.OS === 'android' && location === 'article'
                    ? i === newPos
                        ? color
                        : '#DCDCDC'
                    : newPos.interpolate({
                          ...range(i),
                          extrapolate: 'clamp',
                      })

            dots.push(
                <Animated.View
                    key={i}
                    style={[
                        appliedStyle.dot,
                        {
                            backgroundColor,
                        },
                    ]}
                ></Animated.View>,
            )
        }

        console.log(dotsAllowed, numOfItems)

        return (
            <View
                style={[
                    appliedStyle.dotsContainer,
                    {
                        backgroundColor:
                            dotsAllowed > numOfItems ? 'green' : 'red',
                    },
                ]}
            >
                {dots}
            </View>
        )
    },
)

export { SliderDots, SliderDotsProps, DOT_ARTICLE_WIDTH, DOT_ARTICLE_MARGIN }
