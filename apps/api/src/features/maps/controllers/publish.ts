import type { Response } from "express";
import {
    MAX_PUBLISH_OPS,
    MapEvents,
    PublishRequestSchema,
    PublishTooManyOpsError,
} from "@standin/contracts";
import { MapPublishService } from "@standin/core";
import { EDITOR_SESSION_HEADER } from "@/consts/mapIdSources";
import { parseSchema } from "@/utils/parseSchema";
import { emitPublished } from "@/features/maps/utils/emitPublished";
import { sendError } from "@/utils/sendError";
import { emitMapEvent } from "@/lib/socket/utils/emitMapEvent";
import type { ExtendedRequest } from "@/types/request";

// Publishes the draft of the editor session that holds the lock. The scope in
// the body picks the permission: canEdit for the map, canDecorate for the
// objects, which the service reads from the database. The events
// go out only after the service committed, and the session never comes back
// in the answer.
export const publishMap = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.mapAccess || !req.user) return;

        // Checked before the schema, which would answer 400 for the same case.
        const sent = (req.body as { ops?: unknown } | undefined)?.ops;
        if (Array.isArray(sent) && sent.length > MAX_PUBLISH_OPS) {
            throw new PublishTooManyOpsError();
        }

        const data = parseSchema(PublishRequestSchema, req.body, res);
        if (!data) return;

        const sessionId = req.header(EDITOR_SESSION_HEADER) ?? "";
        const { result, releasedDesks } = await MapPublishService.publish(
            req.user,
            req.mapAccess,
            sessionId,
            data
        );

        emitPublished(req.mapAccess, data.scope, result);
        for (const desk of releasedDesks) {
            emitMapEvent(req.mapAccess, MapEvents.DESK_RELEASED, desk);
        }

        res.status(200).json(result);
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "update",
            reportError: error,
        });
    }
};
