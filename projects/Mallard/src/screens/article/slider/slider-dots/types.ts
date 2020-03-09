import { Animated } from 'react-native'

export interface SliderDotsProps {
    numOfItems: number
    color: string
    location?: 'article' | 'front'
    position: Animated.AnimatedInterpolation
    startIndex?: number
    direction: 'forward' | 'backwards'
}
