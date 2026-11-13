export type AmbientBand = {
    // Where the ring starts, which is the cutoff of the proximity preset.
    innerTiles: number;
    // Where it ends. Equal to innerTiles when the range is off.
    outerTiles: number;
};
