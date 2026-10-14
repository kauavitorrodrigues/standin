import { v7 as uuidv7 } from "uuid";
import {
    mapsTable,
    mapAssetsTable,
    deskAssignmentsTable,
    and,
    eq,
    inArray,
    isNull,
    sql,
} from "@standin/database";
import { DeskClaimedError, MapNotFoundError } from "@standin/contracts";
import type { EditorModel } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import type { MapAccess } from "../types/map-access";
import type { PersistModelDiffOptions } from "./types/persist-options";
import type { PersistModelDiffResult } from "./types/persist-result";
import type { ReleasedDesk } from "./types/released-desk";
import { planModelDiff } from "./utils/planModelDiff";
import { remapParentId } from "./utils/remapParentId";

/**
 * Writes the difference between two editor models on an open transaction.
 * It neither opens a transaction nor locks rows: the caller does both, and
 * rolls everything back when this throws.
 *
 * A deleted desk with an active owner needs its id in `releaseDeskIds`,
 * otherwise `DeskClaimedError` is thrown.
 */
export const persistModelDiff = async (
    tx: DbExecutor,
    access: MapAccess,
    before: EditorModel,
    after: EditorModel,
    options: PersistModelDiffOptions
): Promise<PersistModelDiffResult> => {
    const plan = planModelDiff(before, after);
    const now = new Date();

    let version = before.version;
    if (plan.layoutChanged) {
        const [updated] = await tx
            .update(mapsTable)
            .set({
                layout: after.layout,
                layoutVersion: sql`${mapsTable.layoutVersion} + 1`,
                updatedAt: now,
            })
            .where(
                and(
                    eq(mapsTable.id, access.mapId),
                    isNull(mapsTable.deletedAt)
                )
            )
            .returning({ layoutVersion: mapsTable.layoutVersion });

        if (!updated) throw new MapNotFoundError();
        version = updated.layoutVersion;
    }

    const releasedDesks: ReleasedDesk[] = [];
    if (plan.deletes.length > 0) {
        const owners = await tx
            .select({
                id: deskAssignmentsTable.id,
                mapAssetId: deskAssignmentsTable.mapAssetId,
                userId: deskAssignmentsTable.userId,
            })
            .from(deskAssignmentsTable)
            .where(
                and(
                    inArray(deskAssignmentsTable.mapAssetId, plan.deletes),
                    isNull(deskAssignmentsTable.deletedAt)
                )
            );

        const releasable = new Set(options.releaseDeskIds);
        for (const owner of owners) {
            if (!releasable.has(owner.mapAssetId)) throw new DeskClaimedError();
        }

        if (owners.length > 0) {
            await tx
                .update(deskAssignmentsTable)
                .set({ deletedAt: now })
                .where(
                    inArray(
                        deskAssignmentsTable.id,
                        owners.map(({ id }) => id)
                    )
                );
            releasedDesks.push(
                ...owners.map(({ mapAssetId, userId }) => ({
                    mapAssetId,
                    userId,
                }))
            );
        }

        await tx
            .update(mapAssetsTable)
            .set({ deletedAt: now })
            .where(
                and(
                    eq(mapAssetsTable.mapId, access.mapId),
                    inArray(mapAssetsTable.id, plan.deletes),
                    isNull(mapAssetsTable.deletedAt)
                )
            );
    }

    // The plan puts a parent before its children, so every parent that is new
    // already has its real id when a child is mapped.
    const idMap: Record<string, string> = {};
    for (const item of plan.inserts) {
        idMap[item.id] = uuidv7();
    }
    for (const item of plan.inserts) {
        await tx.insert(mapAssetsTable).values({
            id: idMap[item.id],
            mapId: access.mapId,
            assetId: item.assetId,
            parentId: remapParentId(item.parentId, idMap),
            tileX: item.tileX,
            tileY: item.tileY,
            offsetX: item.offsetX,
            offsetY: item.offsetY,
            propertyOverrides: item.propertyOverrides ?? null,
        });
    }

    for (const item of plan.updates) {
        await tx
            .update(mapAssetsTable)
            .set({
                assetId: item.assetId,
                tileX: item.tileX,
                tileY: item.tileY,
                offsetX: item.offsetX,
                offsetY: item.offsetY,
                parentId: remapParentId(item.parentId, idMap),
                updatedAt: now,
            })
            .where(
                and(
                    eq(mapAssetsTable.id, item.id),
                    eq(mapAssetsTable.mapId, access.mapId)
                )
            );
    }

    return { version, idMap, releasedDesks, limits: after.limits };
};
