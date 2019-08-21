import { Platform, StatusBar, PixelRatio } from 'react-native'
import { Size, toSize } from 'src/helpers/sizes'
import { getFont } from './typography'

const spacing = [0, 3, 6, 12, 18, 30]

const headerHeight = spacing[5]
const basicMetrics = {
    horizontal: 14,
    vertical: 10,
}

const buttonHeight =
    getFont('sans', 1).fontSize * PixelRatio.getFontScale() +
    basicMetrics.vertical * 2.5

const scrubberRadius = 18
export const metrics = {
    ...basicMetrics,
    headerHeight,
    buttonHeight,
    radius: 10,
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
        sides: basicMetrics.horizontal * 1.5,
        cardContainerHeightExtra: scrubberRadius * 2,
        cardSize: toSize(540, 600),
        cardSizeTablet: toSize(650, 725),
        cardSizeTabletShort: toSize(650, 660),
        scrubberRadius,
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
