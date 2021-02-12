import React from 'react'
import { Editions } from 'src/components/icons/Editions'
import { TouchableOpacity, StyleSheet, Text } from 'react-native'
import { color } from 'src/theme/color'
import { LeftChevron } from 'src/components/icons/LeftChevron'
import { getFont } from 'src/theme/typography'
import { metrics } from 'src/theme/spacing'

const styles = (selected: boolean) =>
    StyleSheet.create({
        button: {
            backgroundColor: selected
                ? color.palette.sport.pastel
                : 'transparent',
            borderRadius: 24,
            justifyContent: 'center',
            height: 55,
            width: 90,
            paddingHorizontal: metrics.horizontal,
        },
        label: { color: 'white', ...getFont('sans', 0.5) },
    })

const EditionsMenuButton = ({
    onPress,
    selected = false,
}: {
    onPress: () => void
    selected?: boolean
}) => (
    <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Regions and specials editions menu"
        onPress={onPress}
        style={styles(selected).button}
    >
        {selected ? (
            <LeftChevron />
        ) : (
            <>
                <Editions />
                <Text style={styles(selected).label}>Editions</Text>
            </>
        )}
    </TouchableOpacity>
)

export { EditionsMenuButton }
