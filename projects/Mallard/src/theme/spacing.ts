import { Platform, StatusBar } from 'react-native'

const spacing = [0, 3, 6, 12, 18, 30]

const headerHeight = spacing[5]
const basicMetrics = {
    horizontal: 14,
    vertical: 10,
}

const XY = (width: number, height: number) => ({ width, height })

export const metrics = {
    ...basicMetrics,
    headerHeight,
    frontsPageSides: basicMetrics.horizontal * 1.5,
    article: {
        sides: basicMetrics.horizontal / 2,
        sidesTablet: basicMetrics.horizontal * 1.5,
        maxWidth: 540,
        maxWidthLandscape: 620,
        leftRailLandscape: 120,
        rightRail: 200,
        rightRailLandscape: 260,
    },
    fronts: {
        cardContainerHeightExtra: 60,
        cardSize: XY(540, 600),
        cardSizeTablet: XY(650, 725),
        cardSizeTabletShort: XY(650, 660),
    },
    gridRowSplit: {
        narrow: (width: number) => width * 0.6,
        wide: 200,
    },
    slideCardSpacing:
        Platform.OS === 'ios'
            ? spacing[5] * 2
            : StatusBar.currentHeight || spacing[5] + spacing[5],
}
