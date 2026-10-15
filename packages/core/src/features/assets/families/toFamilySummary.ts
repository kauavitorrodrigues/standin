import type {
    LibraryAsset,
    LibraryFamilySummary,
    LibraryFamilyThumbnail,
} from "@standin/contracts";
import type { FamilySource } from "./loadFamilySources";

/** The whole PNG of the row. For an animated row it is the strip of frames. */
export const toThumbnail = (asset: LibraryAsset): LibraryFamilyThumbnail => ({
    url: asset.url,
    sprite: asset.sprite,
    frameCount: asset.animation?.frameCount ?? 1,
});

const countDistinct = (values: (string | null)[]) =>
    new Set(values.filter((value) => value !== null)).size;

/** One family as a card shows it: represented by its base, counted, flagged. */
export const toFamilySummary = ({
    familyId,
    base,
    rows,
    inUse,
}: FamilySource): LibraryFamilySummary => ({
    familyId,
    key: base.key,
    name: base.name,
    type: base.type,
    category: base.category,
    placement: base.placement,
    footprint: base.footprint,
    thumbnail: toThumbnail(base),
    variantCount: rows.length,
    colorCount: countDistinct(rows.map(({ colorKey }) => colorKey)),
    rotationCount: countDistinct(rows.map(({ rotation }) => rotation)),
    inUse,
    hasParts: rows.some(({ parts }) => parts.length > 0),
});
