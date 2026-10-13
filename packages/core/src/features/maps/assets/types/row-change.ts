export type RowChange = {
    id: string;
    tileX: number;
    tileY: number;
    parentId: string | null;
    assetId?: string;
};
