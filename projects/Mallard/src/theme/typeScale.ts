/*
Type scale for mobile and tablet
*/
export const typeScale = {
    /*
    Backgrounds
    */
    headline: {
        tablet: {
            1: [16, 20],
            2: [19, 22],
            3: [22, 24],
            4: [24, 27],
            5: [28, 30],
            6: [32, 34],
            7: [36, 38],
            8: [40, 44],
        },
        mobile: {
            1: [16, 20],
            2: [19, 22],
            3: [22, 24],
            4: [24, 27],
            5: [28, 30],
            6: [32, 34],
        },
    },
    titlePeice: {
        tablet: {
            1: [16, 20],
            2: [19, 22],
            3: [22, 24],
            4: [24, 27],
            5: [28, 30],
            6: [32, 34],
            7: [36, 38],
            8: [40, 44],
        },
        mobile: {
            1: [16, 20],
            2: [19, 22],
            3: [22, 24],
            4: [24, 27],
            5: [28, 30],
            6: [32, 34],
        },
    },
    text: {
        tablet: {
            1: [16, 24],
            2: [19, 28],
        },
        mobile: {
            1: [16, 24],
        },
    },
    textSans: {
        tablet: {
            1: [16, 24],
            2: [19, 28],
        },
        mobile: {
            1: [16, 24],
        },
    },
}

function typeSize(face, val) {
    var device
    //TODO work out the device width
    var fontFace

    //probably a better way to do this
    if ((face = 'headline')) {
        fontFace = "fontFamily: 'GHGuardianHeadline-Regular'"
    } else if ((face = 'titlePiece')) {
        fontFace = "fontFamily: 'GTGuardianTitlepiece-Bold'"
    } else if ((face = 'text')) {
        fontFace = "fontFamily: 'GuardianTextEgyptian-Reg'"
    } else {
        fontFace = "fontFamily: 'GuardianTextSans-Regular'"
    }

    var fontRequest = typeScale[face][device][val]
    //typeScale.headline.tablet.1 = [16, 22]
    const [fontSize, lineHeight] = fontRequest

    return {
        fontSize: fontSize,
        lineHeight: lineHeight,
        fontFace: fontFace,
    }
}

export { typeSize }
