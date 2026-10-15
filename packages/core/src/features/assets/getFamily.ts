import { ASSET_ROTATIONS, AssetFamilyNotFoundError } from "@standin/contracts";
import type {
    LibraryAsset,
    LibraryFamilyDetail,
    LibraryFamilyGrid,
    LibraryFamilyVariant,
} from "@standin/contracts";
import { loadFamilySources } from "./families/loadFamilySources";
import { toFamilySummary, toThumbnail } from "./families/toFamilySummary";
import { findScopedAsset } from "./utils/loadRows";

const distinctColors = (assets: LibraryAsset[]) => {
    const colors = new Map<string, string>();
    for (const { colorKey, colorHex } of assets) {
        if (colorKey !== null && colorHex !== null) {
            colors.set(colorKey, colorHex);
        }
    }
    return [...colors].map(([key, hex]) => ({ key, hex }));
};

// Colors down, rotations across. The no-rotation column comes first.
const buildGrid = (variants: LibraryFamilyVariant[]): LibraryFamilyGrid => {
    const rotations = Object.values(ASSET_ROTATIONS).filter((rotation) =>
        variants.some((variant) => variant.rotation === rotation)
    );
    const columns: LibraryFamilyGrid["columns"] = variants.some(
        (variant) => variant.rotation === null
    )
        ? [null, ...rotations]
        : rotations;
    const colors = distinctColors(variants);
    const colorKeys: (string | null)[] = variants.some(
        (variant) => variant.colorKey === null
    )
        ? [null, ...colors.map(({ key }) => key)]
        : colors.map(({ key }) => key);

    return {
        columns,
        rows: colorKeys.map((colorKey) => ({
            color: colors.find(({ key }) => key === colorKey) ?? null,
            cells: columns.map(
                (rotation) =>
                    variants.find(
                        (variant) =>
                            variant.colorKey === colorKey &&
                            variant.rotation === rotation
                    ) ?? null
            ),
        })),
    };
};

/**
 * The whole family of any of its rows: the base, then every variation with
 * its own PNG.
 */
export const getLibraryFamily = async (
    assetId: string,
    organizationId: string | null
): Promise<LibraryFamilyDetail> => {
    const asset = await findScopedAsset(assetId, organizationId);
    const [source] = await loadFamilySources(organizationId, {
        familyId: asset.baseAssetId ?? asset.id,
    });
    if (!source) throw new AssetFamilyNotFoundError();

    const variants = source.rows.map((row) => ({
        ...row,
        thumbnail: toThumbnail(row),
    }));

    return {
        ...toFamilySummary(source),
        colors: distinctColors(source.rows),
        rotations: Object.values(ASSET_ROTATIONS).filter((rotation) =>
            source.rows.some((row) => row.rotation === rotation)
        ),
        variants,
        grid: buildGrid(variants),
    };
};
