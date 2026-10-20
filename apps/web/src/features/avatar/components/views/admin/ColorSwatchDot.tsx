type Props = { colorHex: string | null; label: string };

// The swatch of a color, as the editor of avatar shows it. A row without a
// color has no swatch.
export const ColorSwatchDot = ({ colorHex, label }: Props) => {
    if (colorHex === null) return null;

    return (
        <span
            role="img"
            aria-label={label}
            title={label}
            className="inline-block size-4 shrink-0 rounded-full border"
            style={{ backgroundColor: colorHex }}
        />
    );
};
