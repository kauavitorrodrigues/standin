export type RowChange = {
    id: string;
    tileX: number;
    tileY: number;
    offsetX: number;
    offsetY: number;
    parentId: string | null;
    assetId?: string;
};
