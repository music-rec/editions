import { StyleSheet } from 'react-native'
import { DOT_ARTICLE_WIDTH, DOT_ARTICLE_MARGIN } from './constants'
import { metrics } from 'src/theme/spacing'

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

export { styles }
