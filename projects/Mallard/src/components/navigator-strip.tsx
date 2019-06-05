import React from 'react'

import Svg, { Circle, Text, Line, G } from 'react-native-svg'
import { color } from '../theme/color'

const radius = 4
const signPostRadius = 20

const Stop = ({ fill, ...props }: { fill: string; [key: string]: any }) => {
    return <Circle r={radius} cy={signPostRadius} fill={fill} {...props} />
}

const Signpost = ({ fill, title }: { fill: string; title: string }) => (
    <G>
        <Circle
            cy={signPostRadius}
            cx={signPostRadius}
            fill={fill}
            r={signPostRadius}
        />
        <Text
            fill={color.textOverDarkBackground}
            fontSize="30"
            textAnchor="middle"
            fontFamily="GTGuardianTitlepiece-Bold"
            x={signPostRadius}
            y={signPostRadius * 1.5}
        >
            {title[0]}
        </Text>
    </G>
)

const NavigatorStrip = ({
    title,
    fill,
    stops,
}: {
    title: string
    fill: string
    stops: number
}) => {
    const stopElements = []
    for (let i = 1; i < stops - 1; i++) {
        stopElements.push(
            <Stop cx={`${(i / (stops - 1)) * 100}%`} fill={fill} />,
        )
    }

    return (
        <Svg width="100%" height={signPostRadius * 2}>
            <Line
                x1="0"
                y1={signPostRadius}
                x2="100%"
                y2={signPostRadius}
                stroke={fill}
            />
            {stopElements}
            <Stop cx={radius} fill={fill} />
            <Stop cx={'100%'} translateX={radius * -1} fill={fill} />
            <Signpost title={title} fill={fill} />
        </Svg>
    )
}
NavigatorStrip.defaultProps = {
    fill: color.text,
    stops: 3,
}
export { NavigatorStrip }
