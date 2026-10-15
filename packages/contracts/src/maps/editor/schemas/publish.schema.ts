import { z } from "zod/v4";
import { MAX_PUBLISH_OPS } from "../consts/limits";
import { EDIT_SCOPES } from "../consts/edit-scopes";
import { EditorOpSchema } from "./editorOp.schema";
import { PublishErrorMessages as Messages } from "./consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

const publishId = z.uuid({ error: Messages.publishId.invalid });
const ops = z
    .array(EditorOpSchema, { error: Messages.ops.invalid })
    .max(MAX_PUBLISH_OPS, { error: Messages.ops.max });

// The map scope (Studio) is checked against the layout version. A missing
// scope means `map`, which keeps older clients working.
const MapPublishRequestSchema = z.object({
    scope: z.literal(EDIT_SCOPES.MAP).default(EDIT_SCOPES.MAP),
    publishId,
    baseVersion: int(Messages.baseVersion.invalid).min(1, {
        error: Messages.baseVersion.invalid,
    }),
    ops,
});

// The objects scope (decorator) is checked against the objects revision, an
// ISO date, because decorating does not raise the layout version.
const ObjectsPublishRequestSchema = z.object({
    scope: z.literal(EDIT_SCOPES.OBJECTS),
    publishId,
    // Null when the map had no object when the draft was created.
    baseObjectsRevision: z.iso
        .datetime({ error: Messages.baseObjectsRevision.invalid })
        .nullable(),
    ops,
});

export const PublishRequestSchema = z.union(
    [ObjectsPublishRequestSchema, MapPublishRequestSchema],
    { error: Messages.scope.invalid }
);

export const PublishResultSchema = z.object({
    version: int(Messages.version.invalid).min(1, {
        error: Messages.version.invalid,
    }),
    idMap: z.record(z.string(), z.string(), { error: Messages.idMap.invalid }),
    // Objects revision after the publish (ISO date), for the objects scope.
    objectsRevision: z
        .string({ error: Messages.objectsRevision.invalid })
        .nullable()
        .optional(),
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

// One branch each, for code that already knows its scope.
export type MapPublishRequest = z.input<typeof MapPublishRequestSchema>;
export type ObjectsPublishRequest = z.input<typeof ObjectsPublishRequestSchema>;
// What a client sends: the map scope may leave `scope` out.
export type PublishRequest = z.input<typeof PublishRequestSchema>;
// What the server sees after parsing: `scope` is always there.
export type ParsedPublishRequest = z.infer<typeof PublishRequestSchema>;
export type PublishResult = z.infer<typeof PublishResultSchema>;
