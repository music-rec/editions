import { useNetInfo } from '@react-native-community/netinfo'
import React, { useMemo, useState } from 'react'
import { FlatList, Linking, Platform, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { ArticleFeatures, BlockElement } from 'src/common'
import { useArticle } from 'src/hooks/use-article'
import { metrics } from 'src/theme/spacing'
import { ArticlePillar, ArticleType } from '../../../../../common/src'
import { ArticleHeader } from '../article-header'
import { ArticleHeaderProps } from '../article-header/types'
import { PropTypes as StandfirstPropTypes } from '../article-standfirst'
import { createWebViewHTML, EMBED_DOMAIN, renderElement } from '../html/render'
import { Wrap, WrapLayout } from '../wrap/wrap'

const urlIsNotAnEmbed = (url: string) =>
    !(
        url.startsWith(EMBED_DOMAIN) ||
        url.startsWith('https://www.youtube.com/embed')
    )

const features: ArticleFeatures[] = [ArticleFeatures.HasDropCap]

const styles = StyleSheet.create({
    block: {
        alignItems: 'flex-start',
        padding: metrics.horizontal,
        paddingVertical: metrics.vertical,
    },
    webview: {
        backgroundColor: 'transparent',
        width: '100%',
        /*
        The below line fixes crashes on Android
        https://github.com/react-native-community/react-native-webview/issues/429
        */
        opacity: 0.99,
    },
})

// use this to cache heights without causing a memory leak
const heights = new WeakMap()

const BlockWebview = React.memo(
    ({ item }: { item: { string: string; key: string } }) => {
        const [height, _setHeight] = useState(heights.get(item) || 1)

        function setHeight(h: number) {
            heights.set(item, h)
            _setHeight(h)
        }

        return (
            <WebView
                originWhitelist={['*']}
                scrollEnabled={false}
                useWebKit={false}
                source={{ html: item.string }}
                onShouldStartLoadWithRequest={event => {
                    if (
                        Platform.select({
                            ios: event.navigationType === 'click',
                            android: urlIsNotAnEmbed(event.url), // android doesn't have 'click' types so check for our embed types
                        })
                    ) {
                        Linking.openURL(event.url)
                        return false
                    }
                    return true
                }}
                onMessage={event => {
                    if (parseInt(event.nativeEvent.data) !== height) {
                        setHeight(parseInt(event.nativeEvent.data))
                    }
                }}
                style={[
                    styles.webview,
                    {
                        minHeight: height,
                    },
                ]}
            />
        )
    },
)

const mergableTypes: BlockElement['id'][] = ['pullquote']

const mergeBlockHTML = (
    blockElement: BlockElement[],
    {
        showMedia,
        pillar,
        wrapLayout,
    }: {
        showMedia: boolean
        pillar: ArticlePillar
        wrapLayout: WrapLayout
    },
) =>
    blockElement
        .reduce(
            ({ sections, prevId }, el, index) => {
                const html = renderElement(el, {
                    features,
                    showMedia,
                    index,
                })

                const shouldMergeWithPrevious =
                    mergableTypes.includes(el.id) ||
                    mergableTypes.includes(prevId)

                if (shouldMergeWithPrevious) {
                    return {
                        sections: [
                            ...sections.slice(sections.length - 1),
                            `${sections[sections.length - 1]}${html}`,
                        ],
                        prevId: el.id,
                    }
                }

                return {
                    sections: [...sections, html],
                    prevId: el.id,
                }
            },
            { sections: [''], prevId: 'unknown' } as {
                sections: string[]
                prevId: BlockElement['id']
            },
        )
        .sections.map(html => createWebViewHTML(html, { pillar, wrapLayout }))

const ArticleWebview = ({
    article,
    wrapLayout,
    type,
    onTopPositionChange,
    ...headerProps
}: {
    article: BlockElement[]
    wrapLayout: WrapLayout
    type: ArticleType
    onTopPositionChange: (isAtTop: boolean) => void
} & ArticleHeaderProps) => {
    const { isConnected } = useNetInfo()
    const [, { pillar }] = useArticle()

    const blockStrings = useMemo(
        () =>
            mergeBlockHTML(article, {
                pillar,
                wrapLayout,
                showMedia: isConnected,
            }).map((string, i) => ({
                string,
                key: i.toString(),
            })),
        [article, pillar, wrapLayout, isConnected],
    )

    return (
        <FlatList
            debug
            style={{ flex: 1 }}
            data={blockStrings}
            initialNumToRender={3}
            onScroll={ev => {
                onTopPositionChange(ev.nativeEvent.contentOffset.y <= 0)
            }}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
                <ArticleHeader {...headerProps} type={type} />
            )}
            windowSize={5}
            renderItem={info => <BlockWebview item={info.item} />}
            extraData={JSON.stringify({ type, headerProps })}
        />
    )
}

const Article = ({
    article,
    onTopPositionChange,
    ...headerProps
}: {
    article: BlockElement[]
    onTopPositionChange: (isAtTop: boolean) => void
} & ArticleHeaderProps &
    StandfirstPropTypes) => {
    const [wrapLayout, setWrapLayout] = useState<WrapLayout | null>(null)
    const [, { type }] = useArticle()

    return (
        <>
            {wrapLayout && (
                <ArticleWebview
                    article={article}
                    onTopPositionChange={onTopPositionChange}
                    wrapLayout={wrapLayout}
                    type={type}
                    {...headerProps}
                />
            )}
            <Wrap onWrapLayout={setWrapLayout}></Wrap>
        </>
    )
}

export { Article }
