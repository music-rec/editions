import { useNetInfo } from '@react-native-community/netinfo'
import React, { useMemo } from 'react'
import { Animated, Linking, Platform } from 'react-native'
import { WebView, WebViewProps } from 'react-native-webview'
import { ArticleFeatures, BlockElement } from 'src/common'
import { useArticle } from 'src/hooks/use-article'
import { useIssueCompositeKey } from 'src/hooks/use-issue-id'
import { EMBED_DOMAIN, render } from '../../html/render'
import { WrapLayout } from '../../wrap/wrap'
import { ArticleHeaderProps } from '../../article-header/types'

const urlIsNotAnEmbed = (url: string) =>
    !(
        url.startsWith(EMBED_DOMAIN) ||
        url.startsWith('https://www.youtube.com/embed')
    )

const features: ArticleFeatures[] = [ArticleFeatures.HasDropCap]

const WebviewWithArticle = ({
    article,
    wrapLayout,
    headerProps,
    paddingTop = 0,
    ...webViewProps
}: {
    article: BlockElement[]
    wrapLayout: WrapLayout
    headerProps: ArticleHeaderProps
    paddingTop?: number
} & WebViewProps) => {
    const { isConnected } = useNetInfo()
    const [, { pillar }] = useArticle()
    const issueCompositeKey = useIssueCompositeKey()

    const html = useMemo(
        () =>
            render(article, {
                pillar,
                features,
                wrapLayout,
                headerProps,
                showMedia: isConnected,
                height: paddingTop,
                publishedId:
                    (issueCompositeKey && issueCompositeKey.publishedIssueId) ||
                    null,
            }),
        [
            article,
            pillar,
            wrapLayout,
            isConnected,
            paddingTop,
            issueCompositeKey,
        ],
    )

    return (
        <WebView
            {...webViewProps}
            originWhitelist={['*']}
            scrollEnabled={true}
            source={{ html }}
        />
    )
}

export { WebviewWithArticle }
