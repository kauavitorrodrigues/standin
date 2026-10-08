// Stable 0-359 hue from a string, so the same person always gets the same
// color without storing anything.
export const getAvatarHue = (seed: string): number => {
    let hash = 0;
    for (let index = 0; index < seed.length; index++) {
        hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    }
    return hash % 360;
};
