// Every tile of the straight line between two tiles (Bresenham over the grid).
export const getTileLine = (
    from: number,
    to: number,
    columns: number
): number[] => {
    let x = from % columns;
    let y = Math.floor(from / columns);
    const endX = to % columns;
    const endY = Math.floor(to / columns);
    const dx = Math.abs(endX - x);
    const dy = -Math.abs(endY - y);
    const stepX = x < endX ? 1 : -1;
    const stepY = y < endY ? 1 : -1;
    let error = dx + dy;
    const tiles: number[] = [];

    for (;;) {
        tiles.push(y * columns + x);
        if (x === endX && y === endY) return tiles;
        const doubled = 2 * error;
        if (doubled >= dy) {
            error += dy;
            x += stepX;
        }
        if (doubled <= dx) {
            error += dx;
            y += stepY;
        }
    }
};
