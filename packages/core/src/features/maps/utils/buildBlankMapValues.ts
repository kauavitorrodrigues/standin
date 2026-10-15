import { tilesetsTable, and, isNull } from "@standin/database";
import {
    LAYOUT_VALIDATION_LEVELS,
    LayoutValidationError,
    SIZE_TIERS,
    TILE_SIZE,
    generateBlankLayout,
    resolveBlankDefaults,
    validateLayout,
} from "@standin/contracts";
import type { MapSizeTier } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { globalTilesetSelect } from "../consts/select";
import { ensureBlankDefaultLibrary } from "./ensureBlankDefaultLibrary";
import { loadLayoutLibrary } from "./loadLayoutLibrary";

/**
 * The column values of a blank map for a tier, built from the global library
 * defaults. When the library has no default floor, the placeholder library is
 * seeded first. Fails with 422 when the tier is disabled or the defaults stay
 * invalid.
 */
export const buildBlankMapValues = async (
    sizeTier: MapSizeTier,
    tx: DbExecutor
) => {
    const loadGlobalTilesets = () =>
        tx
            .select(globalTilesetSelect)
            .from(tilesetsTable)
            .where(
                and(
                    isNull(tilesetsTable.deletedAt),
                    isNull(tilesetsTable.organizationId)
                )
            )
            .orderBy(tilesetsTable.createdAt);

    let resolved = resolveBlankDefaults(await loadGlobalTilesets());
    if (!resolved.defaults && (await ensureBlankDefaultLibrary())) {
        resolved = resolveBlankDefaults(await loadGlobalTilesets());
    }

    const { defaults, errors } = resolved;
    if (!defaults) throw new LayoutValidationError(errors);

    const layout = generateBlankLayout(sizeTier, defaults);
    const library = await loadLayoutLibrary(
        null,
        layout.tilesets.map(({ name }) => name),
        tx
    );

    const validation = validateLayout(layout, library, {
        level: LAYOUT_VALIDATION_LEVELS.CREATION,
        sizeTier,
    });
    if (validation.errors.length > 0) {
        throw new LayoutValidationError(validation.errors, validation.warnings);
    }

    return {
        layout,
        layoutVersion: 1,
        width: SIZE_TIERS[sizeTier].maxWidth,
        height: SIZE_TIERS[sizeTier].maxHeight,
        tileSize: TILE_SIZE,
        sizeTier,
    };
};
