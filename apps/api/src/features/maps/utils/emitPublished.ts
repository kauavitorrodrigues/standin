import { EDIT_SCOPES, MapEvents } from "@standin/contracts";
import type { EditScopeKind, PublishResult } from "@standin/contracts";
import type { MapAccess } from "@standin/core";
import { emitMapEvent } from "@/lib/socket/utils/emitMapEvent";

/**
 * Tells the room what was published, after the commit. The map scope moves
 * the layout version (`map_published`), the objects scope moves the objects
 * revision (`objects_published`).
 */
export const emitPublished = (
    access: MapAccess,
    scope: EditScopeKind,
    result: PublishResult
): void => {
    switch (scope) {
        case EDIT_SCOPES.OBJECTS:
            emitMapEvent(access, MapEvents.OBJECTS_PUBLISHED, {
                mapId: access.mapId,
                revision: result.objectsRevision ?? new Date().toISOString(),
            });
            return;
        default:
            emitMapEvent(access, MapEvents.MAP_PUBLISHED, {
                mapId: access.mapId,
                version: result.version,
            });
    }
};
