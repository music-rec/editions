import React from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import { HeadlineCardText } from 'src/components/styled-text'
import { metrics } from 'src/theme/spacing'
import { ImageResource } from '../image-resource'
import { ItemTappable, PropTypes } from './helpers/item-tappable'
import { TextBlock } from './helpers/text-block'
import { ImageItem, SplitImageItem, SidekickImageItem } from './image-items'
import { SmallItem, SmallItemLargeText } from './small-items'
import { SuperHeroImageItem } from './super-items'
import { Image, PageLayoutSizes } from 'src/common'
import { useImagePath } from 'src/hooks/use-image-paths'
import { useAspectRatio } from 'src/hooks/use-aspect-ratio'

/*
helpers
*/

/*
COVER ITEM
Text over image. To use in lifestyle & art heros
*/
const coverStyles = StyleSheet.create({
    cover: {
        width: '100%',
        height: '100%',
        flex: 1,
    },
    text: {
        width: '50%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        top: '50%',
        paddingTop: metrics.vertical / 3,
    },
})

const CoverItem = ({ article, size, ...tappableProps }: PropTypes) => {
    return (
        <ItemTappable {...tappableProps} {...{ article }}>
            <View style={coverStyles.cover}>
                {'trailImage' in article && article.trailImage ? (
                    <ImageResource
                        style={coverStyles.cover}
                        image={article.trailImage}
                        use="thumb"
                    />
                ) : null}
                <TextBlock
                    byline={article.byline}
                    type={article.type}
                    kicker={article.kicker}
                    headline={article.headline}
                    style={coverStyles.text}
                    {...{ size }}
                />
            </View>
        </ItemTappable>
    )
}

/*
SPLASH ITEM
Image only
*/
const splashImageStyles = StyleSheet.create({
    image: {
        flex: 0,
        height: '100%',
        resizeMode: 'stretch',
    },
    hidden: {
        opacity: 0,
    },
    overflow: {
        overflow: 'hidden',
    },
})

const screenRatio =
    Dimensions.get('screen').height / Dimensions.get('screen').width

console.log('screenRatio', screenRatio)

const SplashImageItem = ({ article, size, ...tappableProps }: PropTypes) => {
    if (!article.cardImage || !article.cardImageTablet)
        return <SuperHeroImageItem {...tappableProps} {...{ article, size }} />

    const cardImage: Image =
        size.layout === PageLayoutSizes.mobile
            ? {
                  source: (article.cardImage && article.cardImage.source) || '',
                  path: (article.cardImage && article.cardImage.path) || '',
              }
            : {
                  source:
                      (article.cardImageTablet &&
                          article.cardImageTablet.source) ||
                      '',
                  path:
                      (article.cardImageTablet &&
                          article.cardImageTablet.path) ||
                      '',
              }

    return (
        <ItemTappable {...tappableProps} {...{ article }} hasPadding={false}>
            <View style={splashImageStyles.overflow}>
                <ImageResource
                    style={[
                        splashImageStyles.image,
                        // screenRatio < 1.8
                        //     ? { height: '100%' }
                        //     : { width: '100%' },
                    ]}
                    image={cardImage}
                    // setAspectRatio
                    use="full-size"
                    accessibilityLabel={article.headline}
                />
            </View>
            <HeadlineCardText style={[splashImageStyles.hidden]}>
                {article.kicker}
            </HeadlineCardText>
        </ItemTappable>
    )
}

export {
    SplashImageItem,
    SuperHeroImageItem,
    ImageItem,
    SplitImageItem,
    SmallItem,
    SmallItemLargeText,
    CoverItem,
    SidekickImageItem,
}
