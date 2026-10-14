// How the texture of an asset is loaded: a plain image when static, a
// spritesheet of equal frames when animated.
export type AssetTextureSource = {
    key: string;
    url: string;
    frame: { width: number; height: number } | null;
};
