import {
    db,
    mapsTable,
    mapAssetsTable,
    and,
    count,
    eq,
    isNull,
} from "@standin/database";
import {
    LAYOUT_VALIDATION_LEVELS,
    LayoutValidationError,
    MapNotFoundError,
    StaleLayoutVersionError,
    applyOps,
    validateLayout,
} from "@standin/contracts";
import type { LayoutOp } from "@standin/contracts";
import { mapLayoutSelect } from "./consts/select";
import type { LayoutOpsResult } from "./types/layout-ops-result";
import type { MapAccess } from "./types/map-access";
import { loadLayoutLibrary } from "./utils/loadLayoutLibrary";

/**
 * Applies a batch of tile and zone operations. Optimistic concurrency: the
 * update only goes through when the stored version is still `baseVersion`, so
 * a second editor gets a 409 with the current version and reloads. Object
 * operations never touch the layout version.
 */
export const applyLayoutOps = async (
    access: MapAccess,
    baseVersion: number,
    ops: LayoutOp[]
): Promise<LayoutOpsResult> => {
    return db.transaction(async (tx) => {
        const [map] = await tx
            .select(mapLayoutSelect)
            .from(mapsTable)
            .where(
                and(eq(mapsTable.id, access.mapId), isNull(mapsTable.deletedAt))
            );

        if (!map) throw new MapNotFoundError();
        if (map.layoutVersion !== baseVersion) {
            throw new StaleLayoutVersionError(map.layoutVersion);
        }

        const library = await loadLayoutLibrary(
            access.owner.organizationId,
            map.layout.tilesets.map(({ name }) => name),
            tx
        );

        const result = applyOps(map.layout, ops, library);
        if (result.errors.length > 0) {
            throw new LayoutValidationError(result.errors);
        }

        const [{ objectCount }] = await tx
            .select({ objectCount: count() })
            .from(mapAssetsTable)
            .where(
                and(
                    eq(mapAssetsTable.mapId, access.mapId),
                    isNull(mapAssetsTable.deletedAt)
                )
            );

        const validation = validateLayout(result.layout, library, {
            level: LAYOUT_VALIDATION_LEVELS.LIGHT,
            sizeTier: map.sizeTier,
            objectCount,
        });
        if (validation.errors.length > 0) {
            throw new LayoutValidationError(
                validation.errors,
                validation.warnings
            );
        }

        const updated = await tx
            .update(mapsTable)
            .set({ layout: result.layout, layoutVersion: baseVersion + 1 })
            .where(
                and(
                    eq(mapsTable.id, access.mapId),
                    eq(mapsTable.layoutVersion, baseVersion)
                )
            )
            .returning({ layoutVersion: mapsTable.layoutVersion });

        if (updated.length === 0) {
            const [current] = await tx
                .select({ layoutVersion: mapsTable.layoutVersion })
                .from(mapsTable)
                .where(eq(mapsTable.id, access.mapId));
            throw new StaleLayoutVersionError(
                current?.layoutVersion ?? baseVersion
            );
        }

        return { version: updated[0].layoutVersion, ops };
    });
};
