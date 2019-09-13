import { useNetInfo } from '@react-native-community/netinfo'
import React, { useMemo, useRef, useState } from 'react'
import { FlatList, Linking, Platform, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { ArticleFeatures, BlockElement } from 'src/common'
import { Spinner } from 'src/components/spinner'
import { useArticle } from 'src/hooks/use-article'
import { metrics } from 'src/theme/spacing'
import { ArticleType } from '../../../../../common/src'
import { ArticleHeader } from '../article-header'
import { ArticleHeaderProps } from '../article-header/types'
import { PropTypes as StandfirstPropTypes } from '../article-standfirst'
import { EMBED_DOMAIN, render } from '../html/render'
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

const BlockWebview = React.memo(
    ({
        blockString,
        onFirstHeightUpdate,
    }: {
        blockString: string
        onFirstHeightUpdate: () => void
    }) => {
        const [height, _setHeight] = useState(1)
        const hasUpdatedHeight = useRef(false)

        function setHeight(h: number) {
            _setHeight(h)
            if (!hasUpdatedHeight.current) {
                onFirstHeightUpdate()
                hasUpdatedHeight.current = true
            }
        }

        return (
            <WebView
                originWhitelist={['*']}
                scrollEnabled={false}
                useWebKit={false}
                source={{ html: blockString }}
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
                    if (
                        !hasUpdatedHeight.current ||
                        parseInt(event.nativeEvent.data) !== height
                    ) {
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

    // This ensures that the webviews in the flat list render in serial initally so that
    const [renderIndex, setRenderIndex] = useState(1)

    const blockStrings = useMemo(
        () => [
            { string: '', key: '' },
            ...article.map((el, index) => ({
                string: render(el, {
                    pillar,
                    features,
                    wrapLayout,
                    showMedia: isConnected,
                    index,
                }),
                key: index.toString(),
            })),
        ],
        [article, pillar, wrapLayout, isConnected],
    )

    return (
        <FlatList
            style={{ flex: 1 }}
            data={blockStrings}
            initialNumToRender={3}
            onScroll={ev => {
                onTopPositionChange(ev.nativeEvent.contentOffset.y <= 0)
            }}
            windowSize={5}
            renderItem={info => {
                if (info.index === 0) {
                    return <ArticleHeader {...headerProps} type={type} />
                }
                if (info.index <= renderIndex) {
                    return (
                        <BlockWebview
                            blockString={info.item.string}
                            onFirstHeightUpdate={() => {
                                setRenderIndex(curr =>
                                    Math.max(curr, info.index + 1),
                                )
                            }}
                        />
                    )
                } else if (info.index === renderIndex + 1) {
                    return (
                        <View style={{ alignItems: 'center' }}>
                            <Spinner />
                        </View>
                    )
                }
                return null
            }}
            extraData={JSON.stringify({ type, headerProps, renderIndex })}
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
