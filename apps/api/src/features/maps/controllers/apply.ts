import type { Response } from "express";
import {
    ApplyRequestSchema,
    EDIT_SCOPES,
    MAX_PUBLISH_OPS,
    MapEvents,
    PublishTooManyOpsError,
} from "@standin/contracts";
import type { ApplyResult } from "@standin/contracts";
import { MapApplyService } from "@standin/core";
import { parseSchema } from "@/utils/parseSchema";
import { emitPublished } from "@/features/maps/utils/emitPublished";
import { sendError } from "@/utils/sendError";
import { emitMapEvent } from "@/lib/socket/utils/emitMapEvent";
import type { ExtendedRequest } from "@/types/request";

// Applies a list of ops to the layout for a tool (a service token or a
// session) with no editor session: the service takes and releases the lock
// itself. The events go out only after the service committed, like a publish.
// A dry run (`validateOnly`) emits nothing.
export const applyMap = async (req: ExtendedRequest, res: Response) => {
    try {
        if (!req.mapAccess || !req.user) return;

        // Checked before the schema, which would answer 400 for the same case.
        const sent = (req.body as { ops?: unknown } | undefined)?.ops;
        if (Array.isArray(sent) && sent.length > MAX_PUBLISH_OPS) {
            throw new PublishTooManyOpsError();
        }

        const data = parseSchema(ApplyRequestSchema, req.body, res);
        if (!data) return;

        const outcome = await MapApplyService.apply(
            req.user,
            req.mapAccess,
            data
        );
        if (outcome.validated) {
            const validated: ApplyResult = { valid: true };
            return res.status(200).json(validated);
        }

        emitPublished(req.mapAccess, EDIT_SCOPES.MAP, outcome.result);
        for (const desk of outcome.releasedDesks) {
            emitMapEvent(req.mapAccess, MapEvents.DESK_RELEASED, desk);
        }

        res.status(200).json(outcome.result);
    } catch (error) {
        return sendError({
            res,
            resource: "map",
            action: "update",
            reportError: error,
        });
    }
};
