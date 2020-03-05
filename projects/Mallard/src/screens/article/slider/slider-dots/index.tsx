import React from 'react'
import { useDotsAllowed } from 'src/hooks/use-config-provider'
import { SliderDotsProps } from './types'
import { SliderDots } from './SliderDots'
import { SliderDotsOverflow } from './SliderDotsOverflow'

const SliderDotsChoice = (props: SliderDotsProps) => {
    const dotsAllowed = useDotsAllowed()

    return props.numOfItems > dotsAllowed ? (
        <SliderDotsOverflow {...props} />
    ) : (
        <SliderDots {...props} />
    )
}

export { SliderDotsChoice }
