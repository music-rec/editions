import { createMergedHTMLStrings } from '../block-merger'
import {
    BlockElement,
    HTMLElement,
    ImageElement,
} from '../../../../../../common/src'

const HTML = (el: HTMLElement) => el.html
const Image = (el: ImageElement) =>
    `<img src="${el.src.source}${el.src.path}" />`

const renderEl = (el: BlockElement) =>
    el.id === 'html' ? HTML(el) : el.id === 'image' ? Image(el) : ''

const defaultRenderOptions = {
    showMedia: true,
    wrapLayout: {
        width: 100,
        rail: {
            width: 0,
            contentWidth: 0,
        },
        content: {
            width: 0,
        },
    },
    pillar: 'news' as const,
}

describe('createMergedHTMLStrings', () => {
    it('merges mergable elements with the following elements', () => {
        const html = { id: 'html' as const, html: '<p>some html</p>' }
        const image = {
            id: 'image' as const,
            src: { source: 'https://media.gu.com', path: '/my-image' },
        }
        const strs = createMergedHTMLStrings(
            [html, image, html, image],
            defaultRenderOptions,
            ['image'],
            renderEl,
            (str: string) => str,
        )

        expect(strs).toHaveLength(3)
        expect(strs[0]).toBe(HTML(html))
        expect(strs[1]).toBe(`${Image(image)}${HTML(html)}`)
        expect(strs[2]).toBe(Image(image))
    })

    it('does not merge trailing mergable elements in any way', () => {
        const html = { id: 'html' as const, html: '<p>some html</p>' }
        const image = {
            id: 'image' as const,
            src: { source: 'https://media.gu.com', path: '/my-image' },
        }
        const strs = createMergedHTMLStrings(
            [image, html, image, html],
            defaultRenderOptions,
            ['image'],
            renderEl,
            (str: string) => str,
        )

        expect(strs).toHaveLength(2)
        expect(strs[0]).toBe(`${Image(image)}${HTML(html)}`)
        expect(strs[1]).toBe(`${Image(image)}${HTML(html)}`)
    })
})
