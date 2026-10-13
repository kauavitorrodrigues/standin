// The order the seats are drawn in. The picked seat goes last, so it stays on
// top of the others when they are close.
export const getSeatDrawOrder = (
    count: number,
    selected: number | null
): number[] =>
    Array.from({ length: count }, (_, index) => index).sort(
        (a, b) => Number(a === selected) - Number(b === selected)
    );
