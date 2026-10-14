export type TilePut = { x: number; y: number; gid: number };

export type TileRemove = { x: number; y: number };

// The calls a tile diff turns into on one layer.
export type TileLayerPlan = {
    layer: string;
    puts: TilePut[];
    removes: TileRemove[];
};
