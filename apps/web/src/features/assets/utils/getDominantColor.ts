import { COLOR_BUCKET_SIZE, MIN_COLOR_ALPHA } from "../consts/colorNames";

const toHex = (value: number) =>
    Math.round(value).toString(16).padStart(2, "0").toUpperCase();

// The predominant color of RGBA pixel data, as `#RRGGBB`, or null when every
// pixel is transparent. Colors are grouped in buckets so the shades of one
// surface add up, and the answer is the average of the winning bucket.
export const getDominantColor = (data: ArrayLike<number>): string | null => {
    const buckets = new Map<
        string,
        { count: number; r: number; g: number; b: number }
    >();

    for (let index = 0; index < data.length; index += 4) {
        if (data[index + 3] < MIN_COLOR_ALPHA) continue;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const key = [r, g, b]
            .map((channel) => Math.floor(channel / COLOR_BUCKET_SIZE))
            .join(",");
        const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
        bucket.count += 1;
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        buckets.set(key, bucket);
    }

    let best: { count: number; r: number; g: number; b: number } | null = null;
    for (const bucket of buckets.values()) {
        if (!best || bucket.count > best.count) best = bucket;
    }
    if (!best) return null;

    return `#${toHex(best.r / best.count)}${toHex(best.g / best.count)}${toHex(best.b / best.count)}`;
};
