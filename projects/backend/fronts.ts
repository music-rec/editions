import { s3fetch, s3Latest } from './s3'
import {
    Front,
    Collection,
    CAPIArticle,
    Crossword,
    WithColor,
    cardLayouts,
} from './common'
import { LastModifiedUpdater } from './lastModified'
import {
    attempt,
    hasFailed,
    Attempt,
    withFailureMessage,
    hasSucceeded,
    failure,
} from './utils/try'
import { getArticles } from './capi/articles'
import { createCardsFromAllArticlesInCollection } from './utils/collection'
import { getImageFromURL } from './image'
import {
    IssueResponse,
    CollectionResponse,
    ItemResponseMeta,
} from './fronts/issue'

export const parseCollection = async (
    collectionResponse: CollectionResponse,
): Promise<Attempt<Collection>> => {
    const articleFragmentList = collectionResponse.items.map((itemResponse): [
        number,
        ItemResponseMeta,
    ] => [itemResponse.internalPageCode, itemResponse.meta])

    const ids: number[] = articleFragmentList.map(([id]) => id)

    const [capiPrintArticles, capiSearchArticles] = await Promise.all([
        attempt(getArticles(ids, 'printsent')),
        attempt(getArticles(ids, 'search')),
    ])
    if (hasFailed(capiPrintArticles))
        return withFailureMessage(
            capiPrintArticles,
            'Could not connect to capi print sent',
        )
    if (hasFailed(capiSearchArticles))
        return withFailureMessage(
            capiSearchArticles,
            'Could not connect to CAPI',
        )

    const articles: [string, CAPIArticle][] = articleFragmentList
        .filter(([key]) => {
            const inResponse =
                key in capiPrintArticles || key in capiSearchArticles
            if (!inResponse) {
                console.warn(`Removing ${key} as not in CAPI response.`)
            }
            return inResponse
        })
        .map(([key, meta]): [string, CAPIArticle] => {
            const article = capiSearchArticles[key] || capiPrintArticles[key]
            const kicker = (meta && meta.kicker) || article.kicker || '' // I'm not sure where else we should check for a kicker
            const headline = (meta && meta.headline) || article.headline
            const imageOverride =
                meta && meta.imageSrc && getImageFromURL(meta.imageSrc)

            switch (article.type) {
                case 'crossword':
                    return [
                        article.path,
                        {
                            ...article,
                            key: article.path,
                            headline,
                            kicker,
                            crossword: (article.crossword as unknown) as Crossword,
                        },
                    ]

                case 'gallery':
                    const galleryImage = imageOverride || article.image
                    if (galleryImage == null) {
                        throw new Error(
                            `No image found in article: ${article.path}`,
                        )
                    }

                    return [
                        article.path,
                        {
                            ...article,
                            key: article.path,
                            headline,
                            kicker,
                            image: galleryImage,
                        },
                    ]

                case 'article':
                    const articleImage = imageOverride || article.image
                    if (articleImage == null) {
                        throw new Error(
                            `No image found in article: ${article.path}`,
                        )
                    }

                    return [
                        article.path,
                        {
                            ...article,
                            key: article.path,
                            headline,
                            kicker,
                            image: articleImage,
                        },
                    ]

                default:
                    const msg: never = article
                    throw new TypeError(`Unknown type: ${msg}`)
            }
        })

    return {
        key: collectionResponse.id,
        cards: createCardsFromAllArticlesInCollection(cardLayouts, articles),
    }
}

const getDisplayName = (front: string) => {
    const split = front.split('/').pop() || front
    return split.charAt(0).toUpperCase() + split.slice(1)
}

const getFrontColor = (front: string): WithColor => {
    switch (front.split('/').pop() || front) {
        case 'topstories':
            return { color: 'neutral' }
        case 'news':
        case 'new':
            return { color: 'news' }
        case 'opinion':
        case 'journal':
            return { color: 'opinion' }
        case 'sport':
            return { color: 'sport' }
        case 'life':
        case 'review':
        case 'guide':
        case 'weekend':
        case 'food':
            return { color: 'lifestyle' }
    }
    return { color: 'neutral' }
}

export const getFront = async (
    issue: string,
    id: string,
    lastModifiedUpdater: LastModifiedUpdater,
): Promise<Attempt<Front>> => {
    const latest = await s3Latest(`daily-edition/${issue}/`)
    if (hasFailed(latest)) {
        return withFailureMessage(
            latest,
            `Could not get latest issue for ${issue} and ${id}.`,
        )
    }
    const issuePath = latest.key
    const resp = await s3fetch(issuePath)

    if (hasFailed(resp)) {
        return withFailureMessage(
            resp,
            `Attempt to fetch ${issue} and ${id} failed.`,
        )
    }

    lastModifiedUpdater(resp.lastModified)

    const tone = getFrontColor(id)
    const issueResponse: IssueResponse = (await resp.json()) as IssueResponse
    const front = issueResponse.fronts.find(_ => _.name === id)
    if (!front) {
        return failure({ httpStatus: 404, error: new Error('Front not found') })
    }

    const collections = await Promise.all(
        front.collections.map(collection => parseCollection(collection)),
    )

    collections.filter(hasFailed).forEach(failedCollection => {
        console.error(
            `silently removing collection from ${issue}/${id} ${JSON.stringify(
                failedCollection,
            )}`,
        )
    })

    return {
        ...front,
        ...tone,
        displayName: getDisplayName(id),
        collections: collections.filter(hasSucceeded),
        key: id,
    }
}
