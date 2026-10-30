import { z } from "zod/v4";
import { MAX_PUBLISH_OPS } from "../consts/limits";
import { EditorOpSchema } from "./editorOp.schema";
import { PublishResultSchema } from "./publish.schema";
import { ApplyErrorMessages as Messages } from "./consts/error-messages";

// What a tool sends to change the layout of a map without an editor session.
// There is no publish id (the server makes one) and no scope: it is always
// the map.
// A field it does not know is refused, so a client that sends `scope` or
// `publishId` is told they do not belong here.
export const ApplyRequestSchema = z.strictObject({
    baseVersion: z
        .number({ error: Messages.baseVersion.invalid })
        .int({ error: Messages.baseVersion.invalid })
        .min(1, { error: Messages.baseVersion.invalid }),
    ops: z
        .array(EditorOpSchema, { error: Messages.ops.invalid })
        .max(MAX_PUBLISH_OPS, { error: Messages.ops.max }),
    // Replays the ops and writes nothing.
    validateOnly: z
        .boolean({ error: Messages.validateOnly.invalid })
        .default(false),
});

export const ValidatedApplyResultSchema = z.object({ valid: z.literal(true) });

// Like a publish, or just `{ valid: true }` for a dry run.
export const ApplyResultSchema = z.union([
    PublishResultSchema,
    ValidatedApplyResultSchema,
]);

// What a client sends: `validateOnly` may be left out.
export type ApplyRequest = z.input<typeof ApplyRequestSchema>;
export type ParsedApplyRequest = z.infer<typeof ApplyRequestSchema>;
export type ValidatedApplyResult = z.infer<typeof ValidatedApplyResultSchema>;
export type ApplyResult = z.infer<typeof ApplyResultSchema>;
