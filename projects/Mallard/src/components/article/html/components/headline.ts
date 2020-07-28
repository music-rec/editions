import { html } from 'src/helpers/webview'
import { HeaderType, ArticleType, Issue } from 'src/common'
import { ArticleHeaderProps, Image, MainMediaImage } from './header'
import { Quotes } from './icon/quotes'
import { GetImagePath } from 'src/hooks/use-image-paths'
import { Rating } from './rating'
import { SportScore } from './sport-score'

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
    const path = getImagePath(cutout)
    return html`
        <section class="james-headline">
            ${publishedId &&
                cutout &&
                html`
                    <img
                        id="cutout"
                        style="shape-outside: url('${path}'); float:right; max-width: 180px; max-height: 150px; margin-left: 50px;"
                        src="${path}"
                    />
                `}
            <div class="showcase-headline">
                ${getHeadline(articleHeaderType, type, headerProps)}
            </div>
        </section>
        <script type="text/javascript">
            function james() {
                var h1Test = document.querySelector('.james-headline')
                var compStyles = window.getComputedStyle(h1Test)
                var h1Height = compStyles.getPropertyValue('height')
                var inH1Height = parseInt(h1Height)
                if (inH1Height > 150) {
                    document.getElementById('cutout').style.marginTop =
                        inH1Height - 150 + 23
                    document.getElementById('cutout').style.marginLeft = 50
                } else {
                    document.getElementById('cutout').style.marginTop = 20
                    document.getElementById('cutout').style.marginLeft = 50
                }
            }
            setTimeout(() => james(), 1000)
        </script>
    `
}

export { getHeadline, getHeadlineWithCutout }
