import React, { useState, useEffect, ReactNode } from 'react'
import { useJsonOrEndpoint } from 'src/hooks/use-fetch'
import { NavigationScreenProp, NavigationEvents } from 'react-navigation'
import {
    WithArticleAppearance,
    ArticleAppearance,
    articleAppearances,
} from 'src/theme/appearance'
import { Article } from 'src/components/article'
import { Article as ArticleType, Collection } from 'src/common'
import {
    View,
    TouchableOpacity,
    Animated,
    Dimensions,
    Easing,
} from 'react-native'
import { metrics } from 'src/theme/spacing'
import { UiBodyCopy } from 'src/components/styled-text'
import { SlideCard } from 'src/components/layout/slide-card/index'
import { color } from 'src/theme/color'
import { PathToArticle } from './article-screen'
import { withResponse } from 'src/hooks/use-response'
import { FlexErrorMessage } from 'src/components/layout/errors/flex-error-message'
import { ERR_404_REMOTE, ERR_404_MISSING_PROPS } from 'src/helpers/words'
import MaskedView from '@react-native-community/masked-view'
import { Issue } from '../../../backend/common'

export interface PathToArticle {
    collection: Collection['key']
    article: ArticleType['key']
    issue: Issue['key']
}

export interface ArticleTransitionProps {
    startAtHeightFromFrontsItem: number
}

const useArticleResponse = ({ collection, article, issue }: PathToArticle) => {
    const resp = useJsonOrEndpoint<ArticleType>(
        issue,
        `collection/${collection}`,
    )
    if (resp.state === 'success') {
        const articleContent =
            resp.response.articles && resp.response.articles[article]
        if (articleContent) {
            return withResponse<ArticleType>({
                ...resp,
                response: articleContent,
            })
        } else {
            return withResponse<ArticleType>({
                state: 'error',
                error: {
                    message: ERR_404_REMOTE,
                },
            })
        }
    }
    return withResponse<ArticleType>(resp)
}

const Clipper = ({
    children,
    transitionProps,
}: {
    children: ReactNode
    transitionProps?: ArticleTransitionProps
}) => {
    /* 
    This is part of the transition from fronts and it positions 
    the article where it should on screen
    */
    const [windowHeight] = useState(() => Dimensions.get('window').height)
    const [height] = useState(
        () =>
            new Animated.Value(
                (transitionProps &&
                    transitionProps.startAtHeightFromFrontsItem) ||
                    windowHeight,
            ),
    )
    useEffect(() => {
        Animated.sequence([
            Animated.delay(150),
            Animated.timing(height, {
                toValue: windowHeight,
                duration: 300,
                easing: Easing.inOut(Easing.linear),
            }),
        ]).start()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    if (!transitionProps) return <>{children}</>
    return (
        <MaskedView
            style={{ flex: 1, flexDirection: 'row', height: '100%' }}
            maskElement={
                <Animated.View
                    style={{
                        height,
                        flex: 0,
                        backgroundColor: 'black',
                        width: '100%',
                    }}
                />
            }
        >
            {children}
        </MaskedView>
    )
}

const ArticleScreenWithProps = ({
    path,
    articlePrefill,
    transitionProps,
    navigation,
}: {
    navigation: NavigationScreenProp<{}>
    path: PathToArticle
    transitionProps?: ArticleTransitionProps
    articlePrefill?: ArticleType
}) => {
    const [appearance, setAppearance] = useState(0)
    const appearances = Object.keys(articleAppearances)
    const articleResponse = useArticleResponse(path)

    /* 
    we don't wanna render a massive tree at once 
    as the navigator is trying to push the screen bc this
    delays the tap response 
     we can pass this prop to identify if we wanna render 
    just the 'above the fold' content or the whole shebang
    */
    const [viewIsTransitioning, setViewIsTransitioning] = useState(true)

    return (
        <Clipper {...{ transitionProps }}>
            <SlideCard
                {...viewIsTransitioning}
                onDismiss={() => navigation.goBack()}
            >
                <NavigationEvents
                    onDidFocus={() => {
                        setViewIsTransitioning(false)
                    }}
                />
                {articleResponse({
                    error: ({ message }) => (
                        <FlexErrorMessage
                            icon="😭"
                            title={message}
                            style={{ backgroundColor: color.background }}
                        />
                    ),
                    pending: () =>
                        articlePrefill ? (
                            <Article {...articlePrefill} />
                        ) : (
                            <FlexErrorMessage
                                title={'loading'}
                                style={{ backgroundColor: color.background }}
                            />
                        ),
                    success: ({ elements, ...article }) => (
                        <>
                            <View
                                style={{
                                    backgroundColor: 'tomato',
                                    position: 'absolute',
                                    zIndex: 9999,
                                    elevation: 999,
                                    bottom: 100,
                                    right: metrics.horizontal,
                                    alignSelf: 'flex-end',
                                    borderRadius: 999,
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setAppearance(app => {
                                            if (app + 1 >= appearances.length) {
                                                return 0
                                            }
                                            return app + 1
                                        })
                                    }}
                                >
                                    <UiBodyCopy
                                        style={{
                                            backgroundColor: 'tomato',
                                            position: 'absolute',
                                            zIndex: 9999,
                                            elevation: 999,
                                            bottom: 100,
                                            right: metrics.horizontal,
                                            alignSelf: 'flex-end',
                                            borderRadius: 999,
                                        }}
                                    >
                                        {`${appearances[appearance]} 🌈`}
                                    </UiBodyCopy>
                                </TouchableOpacity>
                            </View>
                            <WithArticleAppearance
                                value={
                                    appearances[appearance] as ArticleAppearance
                                }
                            >
                                <Article
                                    article={
                                        viewIsTransitioning
                                            ? undefined
                                            : elements
                                    }
                                    {...article}
                                />
                            </WithArticleAppearance>
                        </>
                    ),
                })}
            </SlideCard>
        </Clipper>
    )
}

export const ArticleScreen = ({
    navigation,
}: {
    navigation: NavigationScreenProp<{}>
}) => {
    const articlePrefill = navigation.getParam('article') as
        | ArticleType
        | undefined

    const path = navigation.getParam('path') as PathToArticle | undefined
    const transitionProps = navigation.getParam('transitionProps') as
        | ArticleTransitionProps
        | undefined

    if (!path || !path.article || !path.collection || !path.issue) {
        return (
            <SlideCard onDismiss={() => navigation.goBack()}>
                <FlexErrorMessage
                    title={ERR_404_MISSING_PROPS}
                    style={{ backgroundColor: color.background }}
                />
            </SlideCard>
        )
    }
    return (
        <ArticleScreenWithProps
            {...{ articlePrefill, path, navigation, transitionProps }}
        />
    )
}

ArticleScreen.navigationOptions = ({
    navigation,
}: {
    navigation: NavigationScreenProp<{}>
}) => ({
    title: navigation.getParam('title', 'Loading'),
    gesturesEnabled: true,
    gestureResponseDistance: {
        vertical: metrics.headerHeight + metrics.slideCardSpacing,
    },
})
