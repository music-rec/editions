import React from 'react'
import { View } from 'react-native'
import { Button, ButtonAppearance } from './Button'
import { useInsets } from 'src/hooks/use-screen'
import { useIssueSummary } from 'src/hooks/use-issue-summary'
export const ReloadButton: React.FC<{
    onPress: (path: PathToIssue) => void
}> = ({ onPress }) => {
    const { top, left } = useInsets()
    const { issueId } = useIssueSummary()
    return (
        <View
            style={[
                {
                    position: 'absolute',
                    top: top + 20,
                    left: left + 20,
                    zIndex: 99999,
                },
            ]}
        >
            <Button
                appearance={ButtonAppearance.tomato}
                onPress={() => onPress(issueId)}
                buttonStyles={{ left: 0 }}
            >
                Reload
            </Button>
        </View>
    )
}
