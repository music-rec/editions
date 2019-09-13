import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-navigation'
import { ArticleType, ArticlePillar } from 'src/common'
import { ArticleController } from 'src/components/article'
import { FlexErrorMessage } from 'src/components/layout/ui/errors/flex-error-message'
import { UiBodyCopy } from 'src/components/styled-text'
import { WithArticle } from 'src/hooks/use-article'
import { useArticleResponse } from 'src/hooks/use-issue'
import { color } from 'src/theme/color'
import { PathToArticle } from '../article-screen'
import { useIsPreview } from 'src/hooks/use-settings'

const styles = StyleSheet.create({
    flex: { flexGrow: 1 },
    container: { height: '100%' },
})

const ArticleScrollWrapper = ({
    children,
    onTopPositionChange,
    width,
}: {
    children: React.ReactNode
    onTopPositionChange: (isAtTop: boolean) => void
    width: number
}) => (
    <ScrollView
        scrollEventThrottle={8}
        onScroll={ev => {
            onTopPositionChange(ev.nativeEvent.contentOffset.y <= 0)
        }}
        style={[styles.container, { width }]}
        contentContainerStyle={styles.flex}
    >
        {children}
    </ScrollView>
)

const ArticleScreenBody = React.memo<{
    path: PathToArticle
    onTopPositionChange: (isAtTop: boolean) => void
    pillar: ArticlePillar
    width: number
    position?: number
}>(({ path, onTopPositionChange, pillar, width, position }) => {
    const articleResponse = useArticleResponse(path)
    const preview = useIsPreview()
    const previewNotice = preview ? `${path.collection}:${position}` : undefined

    return (
        <View style={[styles.container, { width }]}>
            {articleResponse({
                error: ({ message }) => (
                    <FlexErrorMessage
                        title={message}
                        style={{ backgroundColor: color.background }}
                    />
                ),
                pending: () => (
                    <FlexErrorMessage
                        title={'loading'}
                        style={{ backgroundColor: color.background }}
                    />
                ),
                success: article => (
                    <>
                        {previewNotice && (
                            <UiBodyCopy>{previewNotice}</UiBodyCopy>
                        )}
                        <WithArticle
                            type={
                                article.article.articleType ||
                                ArticleType.Article
                            }
                            pillar={pillar}
                        >
                            <ArticleController
                                article={article.article}
                                {...{ width, onTopPositionChange }}
                            />
                        </WithArticle>
                    </>
                ),
            })}
        </View>
    )
})

export { ArticleScreenBody, ArticleScrollWrapper }
