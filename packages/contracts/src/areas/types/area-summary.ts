// One area as the library list shows it.
export type AreaSummary = {
    id: string;
    name: string;
    // Size in tiles.
    width: number;
    height: number;
    objectCount: number;
    thumbnailUrl: string;
    createdBy: string;
    // The area version, as a timestamp in milliseconds.
    updatedAt: number;
};
