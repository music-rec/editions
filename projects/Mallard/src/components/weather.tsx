import React from 'react'
import {
    Text,
    StyleSheet,
    View,
    PixelRatio,
    StyleProp,
    ViewStyle,
} from 'react-native'
import { useCachedOrPromise } from 'src/hooks/use-cached-or-promise'
import { withResponse } from 'src/helpers/response'
import { Forecast } from '../common'
import { metrics } from 'src/theme/spacing'
import { WeatherIcon } from './weather/weatherIcon'
import Moment from 'moment'
import { fetchWeather } from 'src/helpers/fetch'
import { GridRowSplit } from './issue/issue-title'
import { color } from 'src/theme/color'
import { getFont } from 'src/theme/typography'
import { Responsive } from './layout/ui/responsive'

const narrowSpace = String.fromCharCode(8201)

const styles = StyleSheet.create({
    weatherContainerLong: {
        display: 'flex',
        flexDirection: 'row',
        width: 'auto',
        marginBottom: 24,
    },
    weatherContainerNarrow: {
        height: 'auto',
        flexDirection: 'column',
        paddingLeft: metrics.horizontal,
    },
    forecastItem: {
        borderStyle: 'solid',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingTop: 2,
        paddingLeft: 4,
        height: 60 * PixelRatio.getFontScale(),
    },
    forecastItemLong: {
        borderLeftWidth: 1,
        flex: 2,
        borderLeftColor: color.line,
    },
    forecastItemNarrow: {
        marginBottom: metrics.vertical * 2,
        flex: 0,
    },
    temperature: {
        color: '#E05E00',
        ...getFont('sans', 0.5),
    },
    dateTime: {
        color: '#000000',
        ...getFont('sans', 0.5),
    },
    locationNameContainer: {
        flex: 1,
        height: 60,
        flexDirection: 'row',
    },
    locationName: {
        ...getFont('sans', 0.5),
        color: '#000000',
        lineHeight: 35,
    },
    locationPinIcon: {
        fontFamily: 'GuardianIcons-Regular',
        fontSize: 30,
        marginLeft: '-1%',
        color: '#ACACAC',
    },
    root: {
        fontFamily: 'weather',
        alignItems: 'flex-start',
        alignSelf: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flex: 0,
        width: 'auto',
    },
})

/**
 * In future iterations we will use the device to access the user's lat/lon co-ordinates
 * and make a request to http://mobile-weather.guardianapis.com/locations/v1/cities/geoposition/search?q=$LAT,$LON
 * in order to fetch a more specific location code to make the below request. This will require permission from the user
 * to use their location.
 */

const useWeatherResponse = () => {
    const londonLocationCode = 328328
    return withResponse<Forecast[]>(
        useCachedOrPromise(
            fetchWeather<Forecast[]>(
                `forecasts/v1/hourly/12hour/${londonLocationCode}.json?metric=true&language=en-gb`,
            ),
        ),
    )
}

const WeatherIconView = ({
    forecast,
    style,
}: {
    forecast: Forecast
    style?: StyleProp<ViewStyle>
}) => (
    <View style={[styles.forecastItem, style]}>
        <WeatherIcon iconNumber={forecast.WeatherIcon} fontSize={30} />
        <Text numberOfLines={1} ellipsizeMode="clip" style={styles.temperature}>
            {Math.round(forecast.Temperature.Value) +
                ' ' +
                forecast.Temperature.Unit}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="clip" style={styles.dateTime}>
            {Moment(forecast.DateTime).format(
                `h${narrowSpace /* Narrow space for iPhone 5 */}a`,
            )}
        </Text>
    </View>
)

const WeatherWithForecast = ({ forecasts }: { forecasts: Forecast[] }) => {
    if (forecasts && forecasts.length >= 9) {
        /*Get the hourly forecast in 2 hour intervals from the 12 hour forecast.*/
        const intervals = [0, 2, 4, 6, 8].map(idx => forecasts[idx])
        return (
            <Responsive>
                {{
                    0: () => (
                        <View style={styles.weatherContainerNarrow}>
                            {intervals.map(forecast => {
                                return (
                                    <WeatherIconView
                                        style={styles.forecastItemNarrow}
                                        key={forecast.EpochDateTime}
                                        forecast={forecast}
                                    />
                                )
                            })}
                        </View>
                    ),
                    110: () => (
                        <View style={styles.weatherContainerLong}>
                            <GridRowSplit
                                proxy={
                                    <View style={styles.locationNameContainer}>
                                        <Text style={styles.locationPinIcon}>
                                            {'\uE01B'}
                                        </Text>
                                        <Text style={styles.locationName}>
                                            {'London'}
                                        </Text>
                                    </View>
                                }
                            >
                                {intervals.map(forecast => {
                                    return (
                                        <WeatherIconView
                                            style={styles.forecastItemLong}
                                            key={forecast.EpochDateTime}
                                            forecast={forecast}
                                        />
                                    )
                                })}
                            </GridRowSplit>
                        </View>
                    ),
                }}
            </Responsive>
        )
    }

    return <></>
}

const Weather = () => {
    let weatherResponse = useWeatherResponse()

    return weatherResponse({
        error: ({}) => <></>,
        pending: () => <></>,
        success: forecasts => <WeatherWithForecast forecasts={forecasts} />,
    })
}

export { Weather }
