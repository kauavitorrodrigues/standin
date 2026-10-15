type Props = {
    show: boolean;
    color: string;
    children: React.ReactNode;
};

// The marks of a tile (solid, default of the blank map), in its corner.
export const TileMarks = ({ show, color, children }: Props) => {
    if (!show) return null;

    return (
        <span
            className="absolute top-0.5 left-0.5 flex items-center gap-0.5"
            style={{ color }}
        >
            {children}
        </span>
    );
};
