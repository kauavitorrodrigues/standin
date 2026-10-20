export type Rgba = readonly [number, number, number, number];

const CHANNEL_MAX = 255;
const TRANSPARENT: Rgba = [0, 0, 0, 0];

// Integer division of n by d rounding half up.
const divideRounded = (n: number, d: number) =>
    Math.floor((2 * n + d) / (2 * d));

// "Source over destination" in 8 bits, with straight (not premultiplied)
// alpha. Every division rounds half up, so the result is the same everywhere.
export const compositeOver = (source: Rgba, destination: Rgba): Rgba => {
    const sourceAlpha = source[3];
    const destinationAlpha = destination[3];
    if (sourceAlpha === 0)
        return destinationAlpha === 0 ? TRANSPARENT : destination;
    if (sourceAlpha === CHANNEL_MAX || destinationAlpha === 0) return source;

    // Alphas scaled by 255 to stay in integers.
    const behind = destinationAlpha * (CHANNEL_MAX - sourceAlpha);
    const total = sourceAlpha * CHANNEL_MAX + behind;
    const channel = (index: 0 | 1 | 2) =>
        divideRounded(
            source[index] * sourceAlpha * CHANNEL_MAX +
                destination[index] * behind,
            total
        );

    return [
        channel(0),
        channel(1),
        channel(2),
        divideRounded(total, CHANNEL_MAX),
    ];
};
