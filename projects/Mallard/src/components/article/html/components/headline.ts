import { html } from 'src/helpers/webview'
import { HeaderType, ArticleType, Issue } from 'src/common'
import { ArticleHeaderProps, Image } from './header'
import { Quotes } from './icon/quotes'
import { GetImagePath } from 'src/hooks/use-image-paths'

const getHeadline = (
    articleHeaderType: HeaderType,
    articleType: ArticleType,
    headerProps: ArticleHeaderProps,
) => {
    if (articleHeaderType === HeaderType.LargeByline) {
        return html`
            <h1>
                ${(articleType === ArticleType.Opinion ||
                    articleType === ArticleType.Showcase) &&
                    Quotes()}
                <span class="header-top-headline"
                    >${headerProps.headline}
                </span>
                <span class="header-top-byline"
                    >${headerProps.bylineHtml}
                </span>
            </h1>
        `
    } else {
        return html`
            <h1>
                ${headerProps.headline}
            </h1>
        `
    }
}

const getHeadlineWithCutout = (
    type: ArticleType,
    articleHeaderType: HeaderType,
    headerProps: ArticleHeaderProps,
    publishedId: Issue['publishedId'] | null,
    getImagePath: GetImagePath,
) => {
    const cutout =
        (type === ArticleType.Opinion || type === ArticleType.Showcase) &&
        headerProps.bylineImages &&
        headerProps.bylineImages.cutout
    return html`
        <section style="display: flex">
            <div class="showcase-headline">
                ${getHeadline(articleHeaderType, type, headerProps)}
            </div>
            ${publishedId &&
                cutout &&
                html`
                    <div
                        style="display: flex; flex-direction: column; align-items: flex-end"
                    >
                        ${Image({
                            image: cutout,
                            className: 'showcase-image',
                            getImagePath,
                        })}
                    </div>
                `}
        </section>
    `
}

export { getHeadline, getHeadlineWithCutout }
