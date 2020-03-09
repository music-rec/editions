import React from 'react'
import { useDotsAllowed } from 'src/hooks/use-config-provider'
import { SliderDotsProps } from './types'
import { SliderDots } from './SliderDots'
import { SliderDotsOverflow } from './SliderDotsOverflow'

const SliderDotsChoice = (props: SliderDotsProps) => {
    const dotsAllowed = useDotsAllowed()
    console.log(props.direction)

    return props.numOfItems > dotsAllowed ? (
        <SliderDotsOverflow {...props} dotsAllowed={dotsAllowed} />
    ) : (
        <SliderDots {...props} />
    )
}

export { SliderDotsChoice }
