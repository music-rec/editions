import React from 'react'
import { Animated, Platform, StyleSheet, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { useLargeDeviceMemory } from 'src/hooks/use-config-provider'
import { metrics } from 'src/theme/spacing'
import { DOT_ARTICLE_WIDTH, DOT_ARTICLE_MARGIN } from './constants'
import { SliderDotsProps } from './types'

// if numofitems > dotsAllowed then start with small and tiny dot at end
// Maintain visual state of the dots until you hit an edge
// ALways 3 from the end unless you are in the last/first 2

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

const SliderDotsOverflow = React.memo(
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

        console.log(newPos)

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

        return (
            <View
                style={[
                    appliedStyle.dotsContainer,
                    {
                        backgroundColor: 'red',
                    },
                ]}
            >
                {dots}
            </View>
        )
    },
)

export { SliderDotsOverflow }
