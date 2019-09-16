import { useNetInfo } from '@react-native-community/netinfo'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Dimensions, Linking, Platform, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { BlockElement } from 'src/common'
import { useArticle } from 'src/hooks/use-article'
import { metrics } from 'src/theme/spacing'
import { ArticleHeader } from '../article-header'
import { ArticleHeaderProps } from '../article-header/types'
import { PropTypes as StandfirstPropTypes } from '../article-standfirst'
import { EMBED_DOMAIN } from '../html/render'
import { createMergedHTMLStrings } from '../html/block-merger'
import { Wrap, WrapLayout } from '../wrap/wrap'

const urlIsNotAnEmbed = (url: string) =>
    !(
        url.startsWith(EMBED_DOMAIN) ||
        url.startsWith('https://www.youtube.com/embed')
    )

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

const BlockWebview = React.memo(
    ({
        children,
        index,
        onFirstHeight,
    }: {
        children: string
        index: number
        onFirstHeight: (index: number) => void
    }) => {
        const [height, _setHeight] = useState(Dimensions.get('window').height)
        const hasSetHeight = useRef(false)

        const setHeight = (height: number) => {
            _setHeight(height)
            if (!hasSetHeight.current) {
                onFirstHeight(index)
                hasSetHeight.current = true
            }
        }

        return (
            <WebView
                originWhitelist={['*']}
                scrollEnabled={false}
                useWebKit={false}
                source={{ html: children }}
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
                    const h = parseInt(event.nativeEvent.data)
                    if (h !== height) {
                        setHeight(h)
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

const ArticleWebview = ({
    article,
    wrapLayout,
}: {
    article: BlockElement[]
    wrapLayout: WrapLayout
}) => {
    const { isConnected } = useNetInfo()
    const [, { pillar }] = useArticle()
    const [renderIndex, setRenderIndex] = useState(0)

    const blockStrings = useMemo(
        () =>
            createMergedHTMLStrings(article, {
                pillar,
                wrapLayout,
                showMedia: isConnected,
            }),
        [article, pillar, wrapLayout, isConnected],
    )

    const onFirstHeight = useCallback((i: number) => {
        setRenderIndex(curr => Math.max(i + 1 || curr))
    }, [])

    return (
        <>
            {blockStrings.map(
                (str, i) =>
                    i <= renderIndex && (
                        <BlockWebview
                            key={i}
                            index={i}
                            onFirstHeight={onFirstHeight}
                        >
                            {str}
                        </BlockWebview>
                    ),
            )}
        </>
    )
}

const Article = ({
    article,
    ...headerProps
}: {
    article: BlockElement[]
} & ArticleHeaderProps &
    StandfirstPropTypes) => {
    const [wrapLayout, setWrapLayout] = useState<WrapLayout | null>(null)
    const [, { type }] = useArticle()

    return (
        <>
            <ArticleHeader {...headerProps} type={type} />
            {wrapLayout && (
                <ArticleWebview article={article} wrapLayout={wrapLayout} />
            )}
            <Wrap onWrapLayout={setWrapLayout}></Wrap>
        </>
    )
}

export { Article }
