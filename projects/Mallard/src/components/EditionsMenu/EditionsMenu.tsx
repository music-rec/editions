import React from 'react'
import { FlatList, ScrollView } from 'react-native'
import { EditionId, RegionalEdition, SpecialEdition } from 'src/common'
import { metrics } from 'src/theme/spacing'
import { defaultRegionalEditions } from '../../../../Apps/common/src/editions-defaults'
import { IssueButton } from './EditionButton/EditionButton'
import { ItemSeperator } from './ItemSeperator/ItemSeperator'
interface Props {
    navigationPress: () => void
    regionalEditions?: RegionalEdition[]
    selectedEdition: EditionId
    specialEditions?: SpecialEdition[]
    storeSelectedEdition: (
        chosenEdition: RegionalEdition | SpecialEdition,
    ) => void
}

const EditionsMenu: React.FC<Props> = ({
    navigationPress,
    regionalEditions,
    selectedEdition,
    specialEditions,
    storeSelectedEdition,
}) => {
    const renderRegionalItem = ({ item }: { item: RegionalEdition }) => {
        const handlePress = () => {
            storeSelectedEdition(item)
            navigationPress()
        }
        const isSelected = selectedEdition === item.edition ? true : false
        return (
            <IssueButton
                selected={isSelected}
                onPress={handlePress}
                title={item.title}
                subTitle={item.subTitle}
            />
        )
    }

    const renderSpecialItem = ({ item }: { item: SpecialEdition }) => {
        const {
            buttonStyle,
            buttonImageUri,
            edition,
            expiry,
            title,
            subTitle,
        } = item

        const handlePress = () => {
            storeSelectedEdition(item)
            navigationPress()
        }
        return (
            <IssueButton
                title={title}
                subTitle={subTitle}
                imageUri={buttonImageUri}
                expiry={new Date(expiry)}
                titleColor={buttonStyle.title.color}
                selected={selectedEdition === edition ? true : false}
                onPress={handlePress}
                isSpecial
            />
        )
    }

    return (
        <ScrollView
            style={{ paddingTop: 17, paddingHorizontal: metrics.horizontal }}
        >
            <FlatList
                data={regionalEditions || defaultRegionalEditions}
                renderItem={renderRegionalItem}
                ItemSeparatorComponent={() => <ItemSeperator />}
                ListFooterComponent={() => <ItemSeperator />}
            />
            {specialEditions && specialEditions.length > 0 && (
                <>
                    <FlatList
                        data={specialEditions}
                        renderItem={renderSpecialItem}
                        ItemSeparatorComponent={() => <ItemSeperator />}
                    />
                </>
            )}
        </ScrollView>
    )
}

export { EditionsMenu }
