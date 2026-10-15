type Props = { isFamily: boolean };

// Why the whole family goes together, said only when it does.
export const FamilyDeletionNote = ({ isFamily }: Props) => {
    if (!isFamily) return null;
    return <> Como tem variações, a família inteira é apagada.</>;
};
