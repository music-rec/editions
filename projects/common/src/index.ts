export { cardLayouts } from './collection/card-layouts'

interface WithKey {
    key: string
}

export const articlePillars = [
    'news',
    'opinion',
    'sport',
    'culture',
    'lifestyle',
    'neutral',
] as const
export const articleTypes = [
    'article',
    'review',
    'opinion',
    'longread',
] as const

export type PillarFromPalette = typeof articlePillars[number]
export type ArticleType = typeof articleTypes[number]

interface ColorAppearance {
    type: 'custom'
    color: string
}
interface PillarAppearance {
    type: 'pillar'
    name: PillarFromPalette
}

export type Appearance = PillarAppearance | ColorAppearance

export interface Card {
    layout: null
    articles: { [key: string]: CAPIArticle }
}

export interface Temperature {
    Value: number
    Unit: string
    UnitType: number
}

export interface Forecast {
    DateTime: string
    EpochDateTime: number
    WeatherIcon: number
    IconPhrase: string
    HasPrecipitation: false
    IsDaylight: true
    Temperature: Temperature
    PrecipitationProbability: number
    MobileLink: string
    Link: string
}

export interface Content extends WithKey {
    type: string
    headline: string
    kicker: string
    image?: Image
    standfirst?: string
    byline?: string
    bylineImages?: { thumbnail?: Image; cutout?: Image }
}
export interface Article extends Content {
    type: 'article'
    image?: Image
    byline: string
    standfirst: string
    elements: BlockElement[]
}

export interface CrosswordArticle extends Content {
    type: 'crossword'
    crossword: Crossword
}

export interface GalleryArticle extends Content {
    type: 'gallery'
    elements: BlockElement[]
}

export type CAPIArticle = Article | CrosswordArticle | GalleryArticle

export interface IssueSummary extends WithKey {
    name: string
    date: string
}

export interface Issue extends IssueSummary, WithKey {
    fronts: Front['key'][]
    id: string
}

export interface Collection extends WithKey {
    cards: Card[]
}

export type Front = WithKey & {
    collections: Collection[]
    displayName?: string
    canonical?: string
    group?: string
    isHidden?: boolean
    isImageDisplayed?: boolean
    imageHeight?: number
    imageWidth?: number
    imageUrl?: string
    onPageDescription?: string
    description?: string
    title?: string
    webTitle?: string
    navSection?: string
    appearance: Appearance
}

export interface UnknownElement {
    id: 'unknown'
}
export interface HTMLElement {
    id: 'html'
    html: string
}
export interface ImageElement {
    id: 'image'
    src: Image
    alt?: string
    caption?: string
    copyright?: string
}
export interface TweetElement {
    id: 'tweet'
    url: string
    html: string
}
export interface PullquoteElement {
    id: 'pullquote'
    html: string
    role?: string
}

export interface AtomElement {
    id: '⚛︎'
    atomType: string
    html?: string
    css?: string[]
    js?: string[]
}
export type BlockElement =
    | HTMLElement
    | ImageElement
    | UnknownElement
    | TweetElement
    | AtomElement
    | PullquoteElement

export interface CrosswordDimensions {
    cols: number
    rows: number
}

export interface CrosswordPosition {
    x: number
    y: number
}

export interface CrosswordCreator {
    name: string
    webUrl: string
}

export interface CrosswordEntry {
    id: string
    number?: number
    humanNumber?: string
    direction?: string
    position?: CrosswordPosition
    separatorLocations?: { [key: string]: number[] }
    length?: number
    clue?: string
    group?: string[]
    solution?: string
    format?: string
}

export enum CrosswordType {
    QUICK = 0,
    CRYPTIC = 1,
    QUIPTIC = 2,
    SPEEDY = 3,
    PRIZE = 4,
    EVERYMAN = 5,
    DIAN_QUIPTIC_CROSSWORD = 6,
    WEEKEND = 7,
}

export interface CapiDateTime {
    dateTime: number
    iso8601: string
}

export interface Crossword {
    name: string
    type: CrosswordType
    number: number
    date: CapiDateTime
    dimensions: CrosswordDimensions
    entries: CrosswordEntry[]
    solutionAvailable: boolean
    hasNumbers: boolean
    randomCluesOrdering: boolean
    instructions?: string
    creator?: CrosswordCreator
    pdf?: string
    annotatedSolution?: string
    dateSolutionAvailable?: CapiDateTime
}

export type CollectionCardLayout = number[]
export interface CollectionCardLayouts {
    [countOfArticles: number]: CollectionCardLayout
}
export interface CollectionCardLayoutsForFront {
    default: CollectionCardLayouts
    [frontName: string]: CollectionCardLayouts
}

export const issueDir = (issueId: string) => `${issueId}`

export const issuePath = (issueId: string) => `${issueDir(issueId)}/issue`

// const issuePath = (issueId: string) => `${issueDir(issueId)}issue`
export const frontPath = (issueId: string, frontId: string) =>
    `${issueDir(issueId)}/front/${frontId}`

export const issueSummaryPath = () => 'issues'
export const imageSizes = ['phone', 'tablet'] as const
export interface Image {
    source: string
    path: string
}
export interface Palette {
    //the palette from node-vibrant
    Vibrant?: string
    Muted?: string
    DarkVibrant?: string
    DarkMuted?: string
    LightVibrant?: string
    LightMuted?: string
}
export type ImageSize = typeof imageSizes[number] | 'sample'

export const mediaPath = (
    issue: string,
    size: ImageSize,
    source: string,
    path: string,
) => `${issueDir(issue)}/media/${size}/${source}/${path}`

export const coloursPath = (issue: string, source: string, path: string) =>
    `${issueDir(issue)}/colours/${source}/${path}`

export const notNull = <T>(value: T | null | undefined): value is T =>
    value !== null && value !== undefined
