import { BlockElement, ArticlePillar, ArticleFeatures } from 'src/common'
import { createWebViewHTML, renderElement } from '../html/render'
import { WrapLayout } from '../wrap/wrap'

const features: ArticleFeatures[] = [ArticleFeatures.HasDropCap]

/**
 * Any types that might need to be floated should be in this array
 * it means that they are merged with the next webview and the floated
 * styles don't collapse in their own webview
 */
const shouldMergeWithPrevious = (
    prevId: BlockElement['id'] | null,
    mergableTypes: BlockElement['id'][],
) => prevId !== null && mergableTypes.includes(prevId)

const mergeLastStr = (arr: string[], val: string) => [
    ...arr.slice(0, arr.length - 1),
    `${arr[arr.length - 1]}${val}`,
]

const mergeOrAppendString = (
    arr: string[],
    val: string,
    prevId: BlockElement['id'] | null,
    mergableTypes: BlockElement['id'][],
) =>
    shouldMergeWithPrevious(prevId, mergableTypes)
        ? mergeLastStr(arr, val)
        : [...arr, val]

type Accumulator = {
    sections: string[]
    prevId: BlockElement['id'] | null
}

const initialAccumulator: Accumulator = { sections: [], prevId: null }

const createMergedHTMLStrings = (
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
    /** for tests */
    mergableTypes: BlockElement['id'][] = ['pullquote', 'image'],
    renderer = renderElement,
    renderHTML = createWebViewHTML,
) =>
    blockElement
        .reduce(
            ({ sections, prevId }, el, index) => ({
                sections: mergeOrAppendString(
                    sections,
                    renderer(el, {
                        features,
                        showMedia,
                        index,
                    }),
                    prevId,
                    mergableTypes,
                ),
                prevId: el.id,
            }),
            initialAccumulator,
        )
        .sections.map(html => renderHTML(html, { pillar, wrapLayout }))

export { createMergedHTMLStrings }
