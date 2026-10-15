import { v7 as uuidv7 } from "uuid";
import { mapsTable, mapAssetsTable, and, eq, isNull } from "@standin/database";
import {
    LAYOUT_VALIDATION_LEVELS,
    LayoutValidationError,
    MapNotFoundError,
    validateLayout,
} from "@standin/contracts";
import type { MapEntity } from "@standin/contracts";
import type { DbExecutor } from "../../lib/types";
import { mapSelect } from "./consts/select";
import { loadLayoutLibrary } from "./utils/loadLayoutLibrary";

/**
 * Copies a map with its objects into a map for `targetOrganizationId`.
 * Object ids are regenerated and the parent links remapped, so the copy is
 * independent of the original (desks arrive without an owner, and images are
 * only referenced). The copied layout goes through the complete validation.
 */
export const copyMap = async (
    sourceMapId: string,
    targetOrganizationId: string | null,
    tx: DbExecutor
): Promise<MapEntity> => {
    const [source] = await tx
        .select()
        .from(mapsTable)
        .where(and(eq(mapsTable.id, sourceMapId), isNull(mapsTable.deletedAt)));

    if (!source) throw new MapNotFoundError();

    const objects = await tx
        .select()
        .from(mapAssetsTable)
        .where(
            and(
                eq(mapAssetsTable.mapId, sourceMapId),
                isNull(mapAssetsTable.deletedAt)
            )
        );

    const library = await loadLayoutLibrary(
        targetOrganizationId,
        source.layout.tilesets.map(({ name }) => name),
        tx
    );
    const validation = validateLayout(source.layout, library, {
        level: LAYOUT_VALIDATION_LEVELS.COMPLETE,
        sizeTier: source.sizeTier,
        objectCount: objects.length,
    });
    if (validation.errors.length > 0) {
        throw new LayoutValidationError(validation.errors, validation.warnings);
    }

    const [map] = await tx
        .insert(mapsTable)
        .values({
            layout: source.layout,
            layoutVersion: 1,
            width: source.width,
            height: source.height,
            tileSize: source.tileSize,
            sizeTier: source.sizeTier,
        })
        .returning(mapSelect);

    if (objects.length === 0) return map;

    const newIdsByOldId = new Map(objects.map(({ id }) => [id, uuidv7()]));

    await tx.insert(mapAssetsTable).values(
        objects.map((object) => ({
            id: newIdsByOldId.get(object.id)!,
            mapId: map.id,
            assetId: object.assetId,
            tileX: object.tileX,
            tileY: object.tileY,
            offsetX: object.offsetX,
            offsetY: object.offsetY,
            parentId: object.parentId
                ? (newIdsByOldId.get(object.parentId) ?? null)
                : null,
            propertyOverrides: object.propertyOverrides,
        }))
    );

    return map;
};
