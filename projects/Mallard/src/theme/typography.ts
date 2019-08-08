import { pickClosestBreakpoint, Breakpoints } from './breakpoints'
import { Dimensions } from 'react-native'
import { BreakpointList } from 'src/theme/breakpoints'
import { FontSizes } from 'src/theme/typography'

export const families = {
    icon: {
        regular: 'GuardianIcons-Regular',
    },
    sans: {
        regular: 'GuardianTextSans-Regular',
        bold: 'GuardianTextSans-Bold',
    },
    text: {
        regular: 'GuardianTextEgyptian-Reg',
        bold: 'GuardianTextEgyptian-Bold',
    },
    titlepiece: {
        regular: 'GTGuardianTitlepiece-Bold',
    },
    headline: {
        regular: 'GHGuardianHeadline-Regular',
        bold: 'GHGuardianHeadline-Bold',
    },
}

type FontFamily = keyof typeof families

/*
Think of these as ems
*/

const scale = {
    icon: {
        [1]: {
            0: {
                fontSize: 20,
                lineHeight: 20,
            },
        },
    },
    sans: {
        [0.5]: {
            0: {
                fontSize: 13,
                lineHeight: 13,
            },
        },
        [0.9]: {
            0: {
                fontSize: 15,
                lineHeight: 18,
            },
        },
        1: {
            0: {
                fontSize: 17,
                lineHeight: 21,
            },
        },
    },
    text: {
        0.9: {
            0: {
                fontSize: 14,
                lineHeight: 18,
            },
        },
        1: {
            0: {
                fontSize: 17,
                lineHeight: 21,
            },
        },
    },
    headline: {
        1: {
            0: {
                fontSize: 19,
                lineHeight: 22,
            },
            [Breakpoints.tabletVertical]: {
                fontSize: 24,
                lineHeight: 29,
            },
        },
        1.25: {
            0: {
                fontSize: 24,
                lineHeight: 29,
            },
            [Breakpoints.tabletVertical]: {
                fontSize: 28,
                lineHeight: 32,
            },
        },
        1.5: {
            0: {
                fontSize: 28,
                lineHeight: 32,
            },
            [Breakpoints.tabletVertical]: {
                fontSize: 34,
                lineHeight: 38,
            },
        },
        1.75: {
            0: {
                fontSize: 34,
                lineHeight: 38,
            },
            [Breakpoints.tabletVertical]: {
                fontSize: 40,
                lineHeight: 44,
            },
        },
        2: {
            0: {
                fontSize: 40,
                lineHeight: 44,
            },
        },
    },
    titlepiece: {
        1: {
            0: {
                fontSize: 18,
                lineHeight: 20,
            },
        },
        1.25: {
            0: {
                fontSize: 24,
                lineHeight: 26,
            },
        },
        1.5: {
            0: {
                fontSize: 30,
                lineHeight: 33,
            },
        },
        2: {
            0: {
                fontSize: 45,
                lineHeight: 50,
            },
        },
        2.5: {
            0: {
                fontSize: 60,
                lineHeight: 66,
            },
        },
    },
}

export type FontSizes<F extends FontFamily> = keyof typeof scale[F]
export type FontWeights<F extends FontFamily> = keyof typeof families[F]

export const getFont = <F extends FontFamily>(
    family: F,
    level: FontSizes<F>,
    weight: FontWeights<F> = 'regular',
) => {
    const fontAtLevel = (scale[family][level] as unknown) as BreakpointList<{
        fontSize: number
        lineHeight: number
    }>

    const scaleForLevel = pickClosestBreakpoint(
        fontAtLevel,
        Dimensions.get('window').width,
    )
    return {
        fontFamily: families[family][weight],
        ...scaleForLevel,
    }
}
