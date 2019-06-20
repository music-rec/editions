export enum RowSize {
    row,
    third,
    half,
    hero,
    superhero,
}

export const getHeightForSize = (size: RowSize): string => {
    const heights = {
        [RowSize.row]: 'auto',
        [RowSize.third]: `${(2 / 6) * 100}%`,
        [RowSize.half]: '50%',
        [RowSize.hero]: `${(4 / 6) * 100}%`,
        [RowSize.superhero]: 'auto',
    }

    return heights[size]
}
