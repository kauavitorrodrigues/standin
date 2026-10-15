import { COLOR_NAMES } from "../consts/colorNames";

const parseHex = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
];

// The name closest to a `#RRGGBB` color, as a color key.
export const nameColor = (hex: string): string => {
    const [r, g, b] = parseHex(hex);
    let closest: string = COLOR_NAMES[0].key;
    let smallest = Infinity;
    for (const { key, hex: reference } of COLOR_NAMES) {
        const [rr, rg, rb] = parseHex(reference);
        const distance = (r - rr) ** 2 + (g - rg) ** 2 + (b - rb) ** 2;
        if (distance < smallest) {
            smallest = distance;
            closest = key;
        }
    }
    return closest;
};
