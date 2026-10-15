export type PlacedRow = {
    id: string;
    assetId: string;
    tileX: number;
    tileY: number;
    offsetX: number;
    offsetY: number;
    parentId: string | null;
    propertyOverrides: Record<string, unknown> | null;
};
