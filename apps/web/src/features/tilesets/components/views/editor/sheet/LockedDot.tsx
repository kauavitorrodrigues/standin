type Props = { show: boolean };

// The dot on the corner of a tile that maps already use, which cannot change.
export const LockedTileDot = ({ show }: Props) => {
    if (!show) return null;
    return (
        <span className="absolute right-0.5 bottom-0.5 size-1.5 rounded-full bg-white/70" />
    );
};
