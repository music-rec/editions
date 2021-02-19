import React from 'react'
import { NavigationInjectedProps, withNavigation } from 'react-navigation'
import { IssueWithFronts, SpecialEditionHeaderStyles } from 'src/common'
import { useIssueDate } from 'src/helpers/issues'
import {
    navigateToEditionMenu,
    navigateToIssueList,
} from 'src/navigation/helpers/base'
import { IssueMenuButton } from '../../Button/IssueMenuButton'
import { EditionsMenuButton } from '../../EditionsMenu/EditionsMenuButton/EditionsMenuButton'
import { ScreenHeader } from '../ScreenHeader'
import { useEditions } from 'src/hooks/use-edition-provider'

interface Titles {
    title: string
    subTitle: string
}

const IssueScreenHeader = withNavigation(
    ({
        headerStyles,
        issue,
        navigation,
    }: {
        headerStyles?: SpecialEditionHeaderStyles
        issue?: IssueWithFronts
    } & NavigationInjectedProps) => {
        const { date, weekday } = useIssueDate(issue)

        const getDateString = () => {
            const abbreviatedDay = weekday.substring(0, 3)
            return `${abbreviatedDay} ${date}`
        }

        const { setNewEditionSeen, selectedEdition } = useEditions()

        const goToIssueList = () => {
            navigateToIssueList(navigation)
        }

        const handleEditionMenuPress = () => {
            setNewEditionSeen()
            navigateToEditionMenu(navigation)
        }

        const getTitles = (): Titles => {
            if (selectedEdition.editionType !== 'Special') {
                const dateString = getDateString()
                return { title: selectedEdition.title, subTitle: dateString }
            }
            const splitTitle = selectedEdition.title.split('\n')
            return { title: splitTitle[0], subTitle: splitTitle[1] }
        }

        const titles = getTitles()
        return (
            <ScreenHeader
                title={titles.title}
                subTitle={titles.subTitle}
                onPress={goToIssueList}
                rightAction={<IssueMenuButton onPress={goToIssueList} />}
                leftAction={
                    <EditionsMenuButton onPress={handleEditionMenuPress} />
                }
                headerStyles={headerStyles}
            />
        )
    },
)

export { IssueScreenHeader }
