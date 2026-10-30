import { TILE_SIZE, resolveAssetCategory } from "@standin/contracts";
import type {
    AssetDefinition,
    LibraryPalette,
    LibrarySeedFile,
    Tileset,
} from "@standin/contracts";
import type { PngSize, SeedAsset, SeedTileset, SeedVariant } from "../types";

const buildTileset = (entry: SeedTileset, size: PngSize): Tileset => {
    const columns: number = size.width / TILE_SIZE;
    return {
        id: `ts-${entry.key}`,
        name: entry.name,
        url: `/${entry.file}`,
        widthPx: size.width,
        heightPx: size.height,
        columns,
        tileCount: columns * (size.height / TILE_SIZE),
        margin: entry.margin ?? 0,
        spacing: entry.spacing ?? 0,
        tileMeta: entry.tileMeta ?? null,
    };
};

const buildAsset = (
    entry: SeedAsset,
    size: PngSize,
    base?: AssetDefinition,
    variant?: SeedVariant
): AssetDefinition => ({
    id: variant?.key ?? entry.key,
    key: variant?.key ?? entry.key,
    name: entry.name,
    type: entry.type,
    category: resolveAssetCategory(entry.type, entry.category),
    baseAssetId: base?.id ?? null,
    rotation: variant?.rotation ?? entry.rotation ?? null,
    colorKey: variant?.color?.key ?? entry.color?.key ?? null,
    colorHex: variant?.color?.hex ?? entry.color?.hex ?? null,
    url: `/${variant?.file ?? entry.file}`,
    sprite: { w: size.width, h: size.height },
    footprint: {
        offsetX: 0,
        ...(variant?.footprint ?? entry.footprint),
    },
    placement: entry.placement ?? "GROUND",
    surfaceHeightPx: entry.surfaceHeightPx ?? 0,
    solid: entry.solid ?? false,
    action: entry.action ?? null,
    actionParams: variant?.actionParams ?? entry.actionParams ?? null,
    promptText: entry.promptText ?? null,
    animation: entry.animation ?? null,
});

// The palette a map would offer once `library.json` is seeded: tilesets with
// their tile meta and assets with their variants as rows of the same family.
// The ids are the keys. The size of each PNG comes from `sizeOf`.
export const buildLibraryPalette = (
    seed: LibrarySeedFile,
    sizeOf: (file: string) => PngSize
): LibraryPalette => ({
    tilesets: seed.tilesets.map((entry) =>
        buildTileset(entry, sizeOf(entry.file))
    ),
    assets: seed.assets.flatMap((entry) => {
        const base: AssetDefinition = buildAsset(entry, sizeOf(entry.file));
        const variants: AssetDefinition[] = (entry.variants ?? []).map(
            (variant) => buildAsset(entry, sizeOf(variant.file), base, variant)
        );
        return [base, ...variants];
    }),
    categories: [],
    areas: [],
});
