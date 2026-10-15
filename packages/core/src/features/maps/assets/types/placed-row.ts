export type PlacedRow = {
    id: string;
    assetId: string;
    tileX: number;
    tileY: number;
    parentId: string | null;
    propertyOverrides: Record<string, unknown> | null;
};
