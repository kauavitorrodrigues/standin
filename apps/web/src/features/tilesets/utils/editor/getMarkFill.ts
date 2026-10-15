// A mark of a tile is drawn filled or only outlined.
export const getMarkFill = (filled: boolean): string => {
    if (filled) return "currentColor";
    return "none";
};
