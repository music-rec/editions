import React from 'react'
import { SpecialEditionHeaderStyles } from 'src/common'
import { Header } from 'src/components/layout/header/header'
import { IssueTitle } from '../issue/issue-title'
import { styles } from '../styled-text'

interface Props {
    headerStyles?: SpecialEditionHeaderStyles
    leftAction?: React.ReactElement | null
    onPress?: () => void
    rightAction?: React.ReactElement | null
    subTitle?: string
    title?: string
    alignment?: 'drawer'
}

export const ScreenHeader: React.FC<Props> = ({
    headerStyles,
    leftAction,
    onPress,
    rightAction,
    title,
    subTitle,
    alignment,
}) => (
    <Header
        onPress={onPress}
        action={rightAction}
        leftAction={leftAction}
        headerStyles={headerStyles}
        alignment={alignment ? alignment : null}
    >
        {title ? (
            <IssueTitle
                title={title}
                subtitle={subTitle}
                titleStyle={styles.issueLightText}
                overwriteStyles={headerStyles}
            />
        ) : null}
    </Header>
)
