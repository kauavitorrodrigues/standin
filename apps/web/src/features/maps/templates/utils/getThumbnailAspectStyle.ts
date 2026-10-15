// The photo keeps the real proportion of the map, width by height in tiles.
export const getThumbnailAspectStyle = (
    width: number,
    height: number
): { aspectRatio: string } => ({ aspectRatio: `${width} / ${height}` });
