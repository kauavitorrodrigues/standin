export const PART_TILE_ATTRIBUTE = "data-part-tile";

// How far an arrow key moves the focus, in tiles of the grid.
const getStep = (key: string, columns: number): number | null => {
    switch (key) {
        case "ArrowLeft":
            return -1;
        case "ArrowRight":
            return 1;
        case "ArrowUp":
            return -columns;
        case "ArrowDown":
            return columns;
        default:
            return null;
    }
};

// Moves the focus between the tiles of the grid with the arrow keys. Only the
// rows in view are mounted, so a tile that is not there yet is not reached.
// Returns whether the key was handled.
export const moveTileFocus = (
    container: HTMLElement,
    key: string,
    columns: number
): boolean => {
    const step = getStep(key, columns);
    if (step === null) return false;

    const tiles = Array.from(
        container.querySelectorAll<HTMLElement>(`[${PART_TILE_ATTRIBUTE}]`)
    );
    const current = tiles.indexOf(document.activeElement as HTMLElement);
    if (current === -1) return false;

    tiles[current + step]?.focus();
    return true;
};
