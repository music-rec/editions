import React from 'react'
import { Animated, Platform, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { useLargeDeviceMemory } from 'src/hooks/use-config-provider'
import { SliderDotsProps } from './types'
import { styles } from './styles'
import {
    DOT_ARTICLE_WIDTH,
    DOT_ARTICLE_MARGIN,
    DOT_ARTICLE_TINY_WIDTH,
    DOT_ARTICLE_TINY_MARGIN,
    DOT_ARTICLE_SMALL_WIDTH,
    DOT_ARTICLE_SMALL_MARGIN,
} from './constants'

// if numofitems > dotsAllowed then start with small and tiny dot at end
// Maintain visual state of the dots until you hit an edge
// ALways 3 from the end unless you are in the last/first 2

const SliderDotsOverflow = React.memo(
    ({
        numOfItems,
        color,
        location = 'article',
        position,
        startIndex,
        direction,
        dotsAllowed,
    }: SliderDotsProps) => {
        console.log(direction)
        const dots = []
        const isTablet = DeviceInfo.isTablet()
        const appliedStyle = styles(
            color,
            location,
            isTablet,
            DOT_ARTICLE_WIDTH,
            DOT_ARTICLE_MARGIN,
        )

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

        // console.log(newPos)

        for (let i = 0; i < dotsAllowed; i++) {
            const backgroundColor =
                Platform.OS === 'android' && location === 'article'
                    ? i === newPos
                        ? color
                        : '#DCDCDC'
                    : newPos.interpolate({
                          ...range(i),
                          extrapolate: 'clamp',
                      })

            const smallerDotStyle =
                (direction === 'forward' && i == dotsAllowed - 2) ||
                (direction === 'backwards' && i == 1)
                    ? styles(
                          color,
                          location,
                          isTablet,
                          DOT_ARTICLE_SMALL_WIDTH,
                          DOT_ARTICLE_SMALL_MARGIN,
                      ).dot
                    : null

            const tinyDotsStyle =
                (direction === 'forward' && i == dotsAllowed - 1) ||
                (direction === 'backwards' && i == 0)
                    ? styles(
                          color,
                          location,
                          isTablet,
                          DOT_ARTICLE_TINY_WIDTH,
                          DOT_ARTICLE_TINY_MARGIN,
                      ).dot
                    : null

            dots.push(
                <Animated.View
                    key={i}
                    style={[
                        appliedStyle.dot,
                        {
                            backgroundColor,
                            ...smallerDotStyle,
                            ...tinyDotsStyle,
                        },
                    ]}
                ></Animated.View>,
            )
        }

        return <View style={[appliedStyle.dotsContainer]}>{dots}</View>
    },
)

export { SliderDotsOverflow }
