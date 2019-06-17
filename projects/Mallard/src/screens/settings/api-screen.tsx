import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import { List, ListHeading } from '../../components/lists/list'
import { MonoTextBlock } from '../../components/styled-text'
import { container } from '../../theme/styles'
import { useSettings } from '../../hooks/use-settings'
import { NavigationScreenProp } from 'react-navigation'
import { TextInput } from 'react-native-gesture-handler'
import { color } from '../../theme/color'
import { metrics } from '../../theme/spacing'
import { backends, defaultSettings } from '../../helpers/settings'

const styles = StyleSheet.create({
    container,
})

const ApiState = () => {
    const [{ apiUrl }] = useSettings()
    if (apiUrl === defaultSettings.apiUrl) return null
    return (
        <MonoTextBlock>
            API backend pointing to {apiUrl}. This is not PROD!
        </MonoTextBlock>
    )
}

const ApiScreen = ({
    navigation,
}: {
    navigation: NavigationScreenProp<{}>
}) => {
    const [{ apiUrl }, setSetting] = useSettings()

    return (
        <ScrollView style={styles.container}>
            <ListHeading>Selected backend</ListHeading>
            <TextInput
                style={{
                    padding: metrics.horizontal,
                    paddingVertical: metrics.vertical * 2,
                    backgroundColor: color.background,
                    borderBottomColor: color.line,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                }}
                onChangeText={value => {
                    if (value) {
                        setSetting('apiUrl', value)
                    }
                }}
                value={apiUrl || ''}
            />
            <ListHeading>Presets</ListHeading>
            <List
                onPress={({ value }) => {
                    setSetting('apiUrl', value)
                    navigation.goBack()
                }}
                data={backends.map(({ title, value }) => ({
                    title: (apiUrl === value ? '✅ ' : '') + title,
                    explainer: value,
                    key: value,
                    data: { value },
                }))}
            />
        </ScrollView>
    )
}
ApiScreen.navigationOptions = {
    title: 'API Endpoint',
}

export { ApiScreen, ApiState }
