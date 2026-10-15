import type { NextFunction, Response } from "express";
import { MapLockService } from "@standin/core";
import { LockNotHeldError, MapLockedError } from "@standin/contracts";
import { z } from "zod/v4";
import { EDITOR_SESSION_HEADER, type MapIdSource } from "@/consts/mapIdSources";
import type { ExtendedRequest } from "@/types/request";
import { resolveMapId } from "@/utils/resolveMapId";
import { sendError } from "@/utils/sendError";

type Options = {
    // The publish route (B-11) lets the session that holds the lock through.
    // Everything else leaves it off, so the holder is refused too.
    allowHolderSession?: boolean;
};

/**
 * Refuses with 423 every write on a map under an editor lock, from anyone,
 * the holder included. Resolves the map from the route (`source`), so it works
 * on map, space and template routes. Reads, presence and chat never use it.
 */
export const RequiresMapNotLocked = (
    source: MapIdSource,
    { allowHolderSession = false }: Options = {}
) => {
    return async (req: ExtendedRequest, res: Response, next: NextFunction) => {
        try {
            const mapId = await resolveMapId(req, source);
            const lock = MapLockService.get(mapId);
            if (!lock) return next();

            const session = req.header(EDITOR_SESSION_HEADER);
            if (allowHolderSession && !session) throw new LockNotHeldError();
            if (allowHolderSession && session === lock.sessionId) {
                return next();
            }

            throw new MapLockedError(
                { id: lock.userId, name: lock.userName },
                new Date(lock.acquiredAt).toISOString()
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return sendError({ res, error });
            }
            return sendError({
                res,
                resource: "map",
                action: "update",
                reportError: error,
            });
        }
    };
};
