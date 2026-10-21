// A number from `min` up to `max`, from a random source that returns 0 to 1.
export const randomBetween = (
    min: number,
    max: number,
    random: () => number
): number => min + random() * (max - min);
