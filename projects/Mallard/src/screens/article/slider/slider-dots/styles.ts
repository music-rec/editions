import { StyleSheet } from 'react-native'
import { metrics } from 'src/theme/spacing'

const styles = (
    color: string,
    location: string,
    isTablet: boolean,
    width: number,
    margin: number,
) => {
    const dotBuilder = (size: number, marginRight: number) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        marginRight,
    })

    const dotFront = isTablet ? dotBuilder(14, 7) : dotBuilder(10, 4)

    const dotArticle = dotBuilder(width, margin)

    const dot = location === 'article' ? dotArticle : dotFront

    return StyleSheet.create({
        dotsContainer: {
            flexDirection: 'row',
            paddingTop: metrics.vertical,
            alignItems: 'center',
        },
        dot,
        selected: {
            backgroundColor: color,
        },
    })
}

export { styles }
