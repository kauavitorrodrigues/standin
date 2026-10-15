type Props = { cells: number };

// The word for the cells of the footprint, in the right number.
export const CellsLabel = ({ cells }: Props) => {
    if (cells === 1) return <>célula</>;
    return <>células</>;
};
