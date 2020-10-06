import moment from 'moment-timezone'
import * as RNLocalize from 'react-native-localize'

const londonTime = (time?: string | number) => {
    if (time != null) return moment.tz(time, 'Europe/London')
    return moment.tz('Europe/London')
}

const localDateString = (date: Date): string =>
    date.toLocaleDateString(RNLocalize.getLocales()[0].languageTag)

export { londonTime, localDateString }
