type Props = {
    // The size is only known once the crop is marked.
    show: boolean;
    width: number;
    height: number;
};

export const ModeChipSize = ({ show, width, height }: Props) => {
    if (!show) return null;

    return (
        <span className="text-muted-foreground">
            {width} x {height}
        </span>
    );
};
