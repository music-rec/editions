import React from 'react'
import { CAPIArticle } from 'src/common'
import { FlexErrorMessage } from 'src/components/layout/ui/errors/flex-error-message'
import { color } from 'src/theme/color'
import { Article } from './types/article'
import { Crossword } from './types/crossword'
import { Gallery } from './types/gallery'
import { Cartoon } from './types/cartoon'
import { ArticleScrollWrapper } from 'src/screens/article/body'

/*
This is the article view! For all of the articles.
it gets everything it needs from its route
*/

export interface ArticleControllerPropTypes {
    article: CAPIArticle
}

const ArticleController = ({
    article,
    width,
    onTopPositionChange,
}: {
    article: CAPIArticle
    width: number
    onTopPositionChange: (isAtTop: boolean) => void
}) => {
    switch (article.type) {
        case 'article':
            return (
                <Article
                    article={article.elements}
                    onTopPositionChange={onTopPositionChange}
                    {...article}
                />
            )

        case 'gallery':
            return (
                <ArticleScrollWrapper
                    onTopPositionChange={onTopPositionChange}
                    width={width}
                >
                    <Gallery gallery={article} />
                </ArticleScrollWrapper>
            )

        case 'picture':
            return (
                <ArticleScrollWrapper
                    onTopPositionChange={onTopPositionChange}
                    width={width}
                >
                    <Cartoon article={article} />
                </ArticleScrollWrapper>
            )

        case 'crossword':
            return (
                <ArticleScrollWrapper
                    onTopPositionChange={onTopPositionChange}
                    width={width}
                >
                    <Crossword crosswordArticle={article} />
                </ArticleScrollWrapper>
            )

        default:
            const message: never = article
            return (
                <FlexErrorMessage
                    title={message}
                    style={{ backgroundColor: color.background }}
                />
            )
    }
}

export { ArticleController }
