// One tile cell that changed: the layer name, the cell and the gids around it.
export type CellDiff = {
    layer: string;
    x: number;
    y: number;
    before: number;
    after: number;
};
