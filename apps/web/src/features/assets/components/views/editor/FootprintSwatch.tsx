type Props = { solid: boolean };

// The legend of the footprint: filled when it blocks the way, dashed when it
// does not.
export const FootprintSwatch = ({ solid }: Props) => {
    if (solid) {
        return (
            <span className="size-3 rounded-sm border-2 border-red-500 bg-red-500/35" />
        );
    }
    return (
        <span className="size-3 rounded-sm border-2 border-dashed border-red-500 bg-red-500/10" />
    );
};
