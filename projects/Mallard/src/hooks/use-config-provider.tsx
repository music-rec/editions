import React, { createContext, useState, useEffect, useContext } from 'react'
import { Dimensions } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { Breakpoints } from 'src/theme/breakpoints'
import { metrics } from 'src/theme/spacing'
import {
    DOT_ARTICLE_WIDTH,
    DOT_ARTICLE_MARGIN,
} from 'src/screens/article/slider/SliderDots'

const oneGB = 1073741824

const ConfigContext = createContext({
    largeDeviceMemeory: false,
    dimensions: {
        width: 0,
        height: 0,
        scale: 0,
        fontScale: 0,
    },
    dotsAllowed: 0,
})

export const largeDeviceMemory = () => {
    return DeviceInfo.getTotalMemory().then(
        deviceMemory => deviceMemory > oneGB,
    )
}

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const [largeDeviceMemeory, setLargeDeviceMemory] = useState(false)
    const [dimensions, setDimensions] = useState(Dimensions.get('window'))
    const [dotsAllowed, setDotsAllowed] = useState(0)

    useEffect(() => {
        largeDeviceMemory().then(deviceMemory =>
            setLargeDeviceMemory(deviceMemory),
        )
    }, [])
    useEffect(() => {
        const listener = (
            ev: Parameters<
                Parameters<typeof Dimensions.addEventListener>[1]
            >[0],
        ) => {
            /*
            this fixes this issue:
            https://trello.com/c/iEtMz9TH/867-video-stretched-on-ios-and-android-crash-on-orientation-change

            this means we will never relayout on smaller screens. For now this is ok
            because our screen size assumptions are a 1:1 match with iphone/ipad and
            a good enough™ match on android

            a more elegant fix would be to detect when a full screen video/photo
            is playing, basically anything that enables rotation when
            things below it should not rotate, and not relayout then.
            */
            if (
                Math.min(ev.window.width, ev.window.height) >=
                Breakpoints.tabletVertical
            ) {
                setDimensions(ev.window)
            }
        }
        Dimensions.addEventListener('change', listener)
        return () => {
            Dimensions.removeEventListener('change', listener)
        }
    }, [])

    useEffect(() => {
        const widthToUse =
            dimensions.width < metrics.article.maxWidth
                ? dimensions.width
                : metrics.article.maxWidth
        const articleWidth = widthToUse - metrics.article.sides * 2
        const calculateDotsAllowed = Math.floor(
            articleWidth / (DOT_ARTICLE_WIDTH + DOT_ARTICLE_MARGIN),
        )
        setDotsAllowed(calculateDotsAllowed)
    }, [dimensions])

    return (
        <ConfigContext.Provider
            value={{ largeDeviceMemeory, dimensions, dotsAllowed }}
        >
            {children}
        </ConfigContext.Provider>
    )
}

export const useLargeDeviceMemory = () =>
    useContext(ConfigContext).largeDeviceMemeory

export const useDimensions = () => useContext(ConfigContext).dimensions

export const useDotsAllowed = () => useContext(ConfigContext).dotsAllowed
