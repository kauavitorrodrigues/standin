// What the hit test needs from the textures of the scene, so the rule stays
// free of Phaser and a test can pass a fake.
export type ObjectSurface = {
    // Size in px of the first frame of the asset, or null while the texture
    // has not loaded (the footprint stands in then).
    getFrameSize: (assetId: string) => { width: number; height: number } | null;
    // Alpha from 0 to 255 of a pixel of the first frame, or null when unknown.
    getAlpha: (assetId: string, x: number, y: number) => number | null;
};
