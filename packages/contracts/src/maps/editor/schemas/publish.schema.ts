import { z } from "zod/v4";
import { MAX_PUBLISH_OPS } from "../consts/limits";
import { EditorOpSchema } from "./editorOp.schema";
import { PublishErrorMessages as Messages } from "./consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

export const PublishRequestSchema = z.object({
    publishId: z.uuid({ error: Messages.publishId.invalid }),
    baseVersion: int(Messages.baseVersion.invalid).min(1, {
        error: Messages.baseVersion.invalid,
    }),
    ops: z
        .array(EditorOpSchema, { error: Messages.ops.invalid })
        .max(MAX_PUBLISH_OPS, { error: Messages.ops.max }),
});

export const PublishResultSchema = z.object({
    version: int(Messages.version.invalid).min(1, {
        error: Messages.version.invalid,
    }),
    idMap: z.record(z.string(), z.string(), { error: Messages.idMap.invalid }),
    limits: z.object(
        {
            objectsUsed: int(Messages.limits.invalid).min(0, {
                error: Messages.limits.invalid,
            }),
            objectsMax: int(Messages.limits.invalid).min(0, {
                error: Messages.limits.invalid,
            }),
        },
        { error: Messages.limits.invalid }
    ),
});

export type PublishRequest = z.infer<typeof PublishRequestSchema>;
export type PublishResult = z.infer<typeof PublishResultSchema>;
