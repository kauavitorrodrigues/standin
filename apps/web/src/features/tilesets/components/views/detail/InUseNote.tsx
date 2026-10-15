type Props = { inUse: boolean };

export const TilesetInUseNote = ({ inUse }: Props) => {
    if (!inUse) return null;
    return <>, em uso</>;
};
