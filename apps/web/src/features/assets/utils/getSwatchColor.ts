import { IMAGE_COLOR } from "../consts/editorColors";

// The color of the icon of a color row: the one that was picked, or a neutral
// one until there is any.
export const getSwatchColor = (hex: string | undefined): string => {
    if (!hex) return IMAGE_COLOR;
    return hex;
};
