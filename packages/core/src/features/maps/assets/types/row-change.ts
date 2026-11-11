export type RowChange = {
    id: string;
    tileX: number;
    tileY: number;
    offsetX: number;
    offsetY: number;
    parentId: string | null;
    assetId?: string;
    // The new asset has another behavior, so the object loses its params.
    clearBehaviorParams?: boolean;
};
