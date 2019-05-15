import { s3fetch } from './s3'
import fromEntries from 'object.fromentries'
import { Diff } from 'utility-types'

export interface Issue {
    name: string
    fronts: string[]
}

export const getIssue = async (issue: string): Promise<Issue> => {
    const x = await s3fetch(`frontsapi/edition/${issue}/edition.json`)
    return x.json() as Promise<Issue>
}

export const getCollectionsForFront = async (id: string) => {
    const resp = await s3fetch('frontsapi/config/config.json')
    const config: FrontsConfigResponse = (await resp.json()) as FrontsConfigResponse

    if (!(id in config.fronts)) throw new Error('Front not found')
    const front = config.fronts[id]
    const collectionIds = front.collections

    // const collections =
    const collections = Object.entries(config.collections)

    const selected = collections.filter(c => collectionIds.includes(c[0]))

    const cs: { [key: string]: CollectionConfigResponse } = fromEntries(
        selected,
    ) //This is a polyfill of Object.Entries which is a bit tooo new.

    return { ...front, collections: cs }
}

export const getCollection = async (id: string) => {
    const resp = await s3fetch(`frontsapi/collection/${id}/collection.json`)
    const collection: CollectionFromResponse = await resp.json()
    return {
        name: collection.displayName,
        contents: collection.live,
    }
}

//from https://github.com/guardian/facia-tool/blob/681fe8e6c37e815b15bf470fcd4c5ef4a940c18c/client-v2/src/shared/types/Collection.ts#L95-L107

interface CollectionFromResponse {
    live: NestedArticleFragment[]
    previously?: NestedArticleFragment[]
    draft?: NestedArticleFragment[]
    lastUpdated?: number
    updatedBy?: string
    updatedEmail?: string
    platform?: string
    displayName: string
    groups?: string[]
    metadata?: { type: string }[]
    uneditable?: boolean
}
interface NestedArticleFragmentRootFields {
    id: string
    frontPublicationDate: number
    publishedBy?: string
}

type NestedArticleFragment = NestedArticleFragmentRootFields & {
    meta: {
        supporting?: Diff<NestedArticleFragment, { supporting: unknown }>[]
        group?: string | null
    }
}

//the following types are stubs of https://github.com/guardian/facia-tool/blob/6970833aa5302522e25045c49302edb07a2b0a54/client-v2/src/types/FaciaApi.ts#L49-L56

interface FrontsConfigResponse {
    fronts: {
        [id: string]: FrontConfigResponse
    }
    collections: {
        [id: string]: CollectionConfigResponse
    }
}

interface FrontConfigResponse {
    collections: string[]
    priority?: unknown
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
}

interface CollectionConfigResponse {
    displayName: string
    type: string
    backfill?: unknown
    href?: string
    groups?: string[]
    metadata?: unknown[]
    uneditable?: boolean
    showTags?: boolean
    hideKickers?: boolean
    excludedFromRss?: boolean
    description?: string
    showSections?: boolean
    showDateHeader?: boolean
    showLatestUpdate?: boolean
    excludeFromRss?: boolean
    hideShowMore?: boolean
    platform?: unknown
    frontsToolSettings?: unknown
}
