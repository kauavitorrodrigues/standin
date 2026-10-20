import {
    AVATAR_OUTLINE,
    AVATAR_OUTLINE_STYLES,
    type AvatarOutlineStyle,
} from "@/features/game/consts/avatar-outline";

const CHANNELS = 4;
const OPAQUE = 255;
const NEIGHBOR_STEPS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
] as const;

type Rgb = { r: number; g: number; b: number };

const getLuminance = (r: number, g: number, b: number): number =>
    0.299 * r + 0.587 * g + 0.114 * b;

/**
 * The pixels of the look of one frame, as RGBA, on a canvas bigger than the
 * frame by the padding on each side: the ring around the body and, in the
 * full style, the body in see-through blue, the darker edge and the light
 * details as they were.
 */
export const buildAvatarOutlinePixels = (
    source: Uint8ClampedArray,
    width: number,
    height: number,
    style: AvatarOutlineStyle
): { pixels: Uint8ClampedArray; width: number; height: number } => {
    const pad = AVATAR_OUTLINE.PADDING_PX;
    const outWidth = width + pad * 2;
    const outHeight = height + pad * 2;
    const pixels = new Uint8ClampedArray(outWidth * outHeight * CHANNELS);

    const isBody = (x: number, y: number): boolean => {
        if (x < 0 || y < 0 || x >= width || y >= height) return false;

        return (
            source[(y * width + x) * CHANNELS + 3]! >=
            AVATAR_OUTLINE.BODY_ALPHA_THRESHOLD
        );
    };

    const isHighlight = (x: number, y: number): boolean => {
        if (!isBody(x, y)) return false;

        const at = (y * width + x) * CHANNELS;
        return (
            getLuminance(source[at]!, source[at + 1]!, source[at + 2]!) >=
            AVATAR_OUTLINE.HIGHLIGHT_LUMINANCE
        );
    };

    // Beside the empty frame or beside a light detail.
    const isEdge = (x: number, y: number): boolean =>
        NEIGHBOR_STEPS.some(
            ([dx, dy]) => !isBody(x + dx, y + dy) || isHighlight(x + dx, y + dy)
        );

    const isRing = (x: number, y: number): boolean => {
        const reach = AVATAR_OUTLINE.RING_REACH_STEPS;
        for (let dy = -reach; dy <= reach; dy++) {
            for (let dx = -reach; dx <= reach; dx++) {
                const steps = Math.abs(dx) + Math.abs(dy);
                if (steps <= reach && isBody(x + dx, y + dy)) return true;
            }
        }
        return false;
    };

    const paint = (x: number, y: number, color: Rgb, alpha: number): void => {
        const at = ((y + pad) * outWidth + (x + pad)) * CHANNELS;
        pixels[at] = color.r;
        pixels[at + 1] = color.g;
        pixels[at + 2] = color.b;
        pixels[at + 3] = alpha;
    };

    for (let y = -pad; y < height + pad; y++) {
        for (let x = -pad; x < width + pad; x++) {
            if (!isBody(x, y)) {
                if (isRing(x, y))
                    paint(x, y, AVATAR_OUTLINE.RING_COLOR, OPAQUE);
                continue;
            }

            if (style === AVATAR_OUTLINE_STYLES.RING_ONLY) continue;

            const at = (y * width + x) * CHANNELS;
            if (isHighlight(x, y)) {
                paint(
                    x,
                    y,
                    { r: source[at]!, g: source[at + 1]!, b: source[at + 2]! },
                    source[at + 3]!
                );
            } else if (isEdge(x, y)) {
                paint(x, y, AVATAR_OUTLINE.EDGE_COLOR, OPAQUE);
            } else {
                paint(
                    x,
                    y,
                    AVATAR_OUTLINE.BODY_COLOR,
                    Math.round(OPAQUE * AVATAR_OUTLINE.BODY_ALPHA)
                );
            }
        }
    }

    return { pixels, width: outWidth, height: outHeight };
};
