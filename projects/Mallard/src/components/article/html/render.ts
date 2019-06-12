import { BlockElement, HTMLElement } from '../../../common'
import { metrics } from '../../../theme/spacing'
import { color } from '../../../theme/color'
import { generateAssetsFontCss, css, makeHtml } from '../../../helpers/webview'

const styles = css`
    ${generateAssetsFontCss('GuardianTextEgyptian-Reg')}
    * {
        margin: 0;
        padding: 0;
    }
    #app {
        font-family: 'GuardianTextEgyptian-Reg';
        padding: ${metrics.vertical}px ${metrics.horizontal}px;
    }
    #app p {
        margin-bottom: ${metrics.vertical * 2}px;
    }
    #app a {
        color: ${color.primary};
        text-decoration-color: ${color.line};
    }
`

export const render = (article: BlockElement[]) => {
    const html = article
        .filter(el => el.id === 'html')
        .map(el => (el as HTMLElement).html)
        .join('')

    return makeHtml({ styles, html })
}
