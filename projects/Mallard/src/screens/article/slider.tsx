import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    Animated,
    Platform,
    StyleSheet,
    View,
    ViewProps,
    Alert,
} from 'react-native'
import ViewPagerAndroid from '@react-native-community/viewpager'
import { CAPIArticle, Collection, Front, Issue } from 'src/common'
import { MaxWidthWrap } from 'src/components/article/wrap/max-width'
import { AnimatedFlatListRef } from 'src/components/front/helpers/helpers'
import { Slider } from 'src/components/slider'
import { safeInterpolation, clamp } from 'src/helpers/math'
import { getColor } from 'src/helpers/transform'
// import { useAlphaIn } from 'src/hooks/use-alpha-in'
import { getAppearancePillar } from 'src/hooks/use-article'
import { useDimensions, useMediaQuery } from 'src/hooks/use-screen'
import { ArticleNavigationProps } from 'src/navigation/helpers/base'
import { Breakpoints } from 'src/theme/breakpoints'
import { color } from 'src/theme/color'
import { metrics } from 'src/theme/spacing'
import { ArticleScreenBody } from '../article/body'
import { useDismissArticle } from 'src/hooks/use-dismiss-article'
import { getArticleDataFromNavigator, ArticleSpec } from '../article-screen'

export interface PathToArticle {
    collection: Collection['key']
    front: Front['key']
    article: CAPIArticle['key']
    issue: Issue['key']
}

export interface SliderSection {
    items: number
    title: string
    color: string
    startIndex: number
}

export interface ArticleTransitionProps {
    startAtHeightFromFrontsItem: number
}

const styles = StyleSheet.create({
    slider: {
        paddingVertical: metrics.vertical,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: color.background,
        flexDirection: 'column',
    },
    innerSlider: {
        width: '100%',
        flexShrink: 0,
        flexGrow: 1,
    },
    sliderBorder: {
        borderBottomColor: color.line,
    },
    androidPager: {
        flexGrow: 1,
        width: '100%',
    },
})

const SliderSectionBar = ({
    section,
    animatedValue,
}: {
    section: SliderSection
    animatedValue: Animated.AnimatedInterpolation
}) => {
    const isTablet = useMediaQuery(width => width >= Breakpoints.tabletVertical)
    const [sliderPos] = useState(() =>
        animatedValue
            .interpolate({
                inputRange: [
                    section.startIndex,
                    section.startIndex + section.items,
                ],
                outputRange: [
                    section.startIndex,
                    section.startIndex + section.items,
                ],
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            })
            .interpolate({
                inputRange: [
                    section.startIndex,
                    section.startIndex + section.items,
                ],
                outputRange: [0, 1],
            }),
    )

    return (
        <View
            style={[
                styles.innerSlider,
                isTablet && {
                    marginHorizontal: metrics.fronts.sliderRadius * -0.8,
                },
            ]}
        >
            <Slider
                small
                title={section.title}
                fill={section.color}
                stops={2}
                position={sliderPos}
            />
        </View>
    )
}

const SliderBar = ({
    sections,
    wrapperProps,
    animatedValue,
}: {
    sections: SliderSection[]
    wrapperProps: ViewProps
    animatedValue: Animated.AnimatedInterpolation
}) => {
    return (
        <View {...wrapperProps} style={[styles.slider, wrapperProps.style]}>
            <MaxWidthWrap>
                {sections.map(s => (
                    <SliderSectionBar
                        section={s}
                        animatedValue={animatedValue}
                        key={s.title}
                    />
                ))}
            </MaxWidthWrap>
        </View>
    )
}

const ArticleSlider = ({
    path,
    articleNavigator,
}: Required<Pick<ArticleNavigationProps, 'articleNavigator' | 'path'>>) => {
    const [articleIsAtTop, setArticleIsAtTop] = useState(true)

    const { startingPoint, flattenedArticles } = getArticleDataFromNavigator(
        articleNavigator,
        path,
    )
    const [current, setCurrent] = useState(startingPoint)

    console.log('render!')

    const { width } = useDimensions()
    const flatListRef = useRef<AnimatedFlatListRef | undefined>()

    useEffect(() => {
        flatListRef.current &&
            flatListRef.current._component.scrollToIndex({
                index: current,
                animated: false,
            })
    }, [width]) // eslint-disable-line react-hooks/exhaustive-deps

    const onTopPositionChange = useCallback((isAtTop: boolean) => {
        setArticleIsAtTop(isAtTop)
    }, [])

    const { panResponder } = useDismissArticle()

    const currentArticle = flattenedArticles[Math.floor(current)]

    const pillar = getAppearancePillar(currentArticle.appearance)

    const sliderSections = articleNavigator.reduce(
        (sectionsWithStartIndex, frontSpec) => {
            const sections = sectionsWithStartIndex.sections.concat({
                items: frontSpec.articleSpecs.length,
                title: frontSpec.frontName,
                color: getColor(frontSpec.appearance),
                startIndex: sectionsWithStartIndex.sectionCounter,
            })
            return {
                sectionCounter:
                    sectionsWithStartIndex.sectionCounter +
                    frontSpec.articleSpecs.length,
                sections: sections,
            }
        },
        { sectionCounter: 0, sections: [] as SliderSection[] },
    ).sections

    const sectionCount = sliderSections.reduce((acc, s) => acc + s.items, 0)
    const [animatedValue] = useState(new Animated.Value(startingPoint))

    const interpolatedValue = animatedValue.interpolate({
        inputRange: [0, sectionCount * width],
        outputRange: [0, sectionCount],
    })

    if (Platform.OS === 'android')
        return (
            <>
                <SliderBar
                    sections={sliderSections}
                    wrapperProps={{
                        style: !articleIsAtTop && styles.sliderBorder,
                    }}
                    animatedValue={interpolatedValue}
                />
                <ViewPagerAndroid
                    style={styles.androidPager}
                    initialPage={startingPoint}
                    onPageSelected={(ev: any) => {
                        setCurrent(ev.nativeEvent.position)
                    }}
                >
                    {flattenedArticles.map((item, index) => (
                        <View key={index}>
                            {index >= current - 1 && index <= current + 1 ? (
                                <ArticleScreenBody
                                    width={width}
                                    path={item}
                                    pillar={pillar}
                                    onTopPositionChange={onTopPositionChange}
                                    position={index}
                                />
                            ) : null}
                        </View>
                    ))}
                </ViewPagerAndroid>
            </>
        )

    return (
        <>
            <SliderBar
                sections={sliderSections}
                wrapperProps={{
                    ...panResponder.panHandlers,
                    style: !articleIsAtTop && styles.sliderBorder,
                }}
                animatedValue={interpolatedValue}
            />

            <Animated.FlatList
                ref={(flatList: AnimatedFlatListRef) =>
                    (flatListRef.current = flatList)
                }
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [
                        {
                            nativeEvent: {
                                contentOffset: { x: animatedValue },
                            },
                        },
                    ],
                    {
                        useNativeDriver: true,
                        listener: (ev: any) => {
                            const newPos =
                                ev.nativeEvent.contentOffset.x / width
                            setCurrent(
                                clamp(
                                    Math.floor(newPos),
                                    0,
                                    flattenedArticles.length - 1,
                                ),
                            )
                        },
                    },
                )}
                maxToRenderPerBatch={1}
                windowSize={2}
                initialNumToRender={1}
                horizontal={true}
                initialScrollIndex={startingPoint}
                pagingEnabled
                getItemLayout={(_: never, index: number) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                keyExtractor={(item: ArticleSpec) => item.article}
                data={flattenedArticles}
                renderItem={({
                    item,
                    index,
                }: {
                    item: ArticleSpec
                    index: number
                }) => (
                    <ArticleScreenBody
                        width={width}
                        path={item}
                        pillar={pillar}
                        onTopPositionChange={onTopPositionChange}
                        position={index}
                    />
                )}
            />
        </>
    )
}

export { ArticleSlider }
