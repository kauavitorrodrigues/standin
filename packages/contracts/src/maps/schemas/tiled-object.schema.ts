import { z } from "zod/v4";
import { MAP_OBJECT_ACTIONS } from "../enums/map-object-action";
import {
    MapObjectErrorMessages,
    TiledObjectErrorMessages,
} from "./consts/error-messages";
import { TiledObjectPropertySchema } from "./tiled-object-property.schema";

export const TiledObjectSchema = z.object({
    id: z.number({ error: TiledObjectErrorMessages.id.required }),
    name: z.string({ error: TiledObjectErrorMessages.name.required }),
    type: z.string({ error: TiledObjectErrorMessages.type.required }),
    gid: z.number({ error: TiledObjectErrorMessages.gid.invalid }).optional(),
    x: z.number({ error: TiledObjectErrorMessages.x.required }),
    y: z.number({ error: TiledObjectErrorMessages.y.required }),
    width: z.number({ error: TiledObjectErrorMessages.width.required }),
    height: z.number({ error: TiledObjectErrorMessages.height.required }),
    properties: z
        .array(TiledObjectPropertySchema, {
            error: TiledObjectErrorMessages.properties.invalid,
        })
        .optional(),
});

export type TiledObjectSchemaType = z.infer<typeof TiledObjectSchema>;

export type NormalizedMapObjectProperties = Record<string, unknown>;

export const normalizeMapObjectProperties = (
    object: TiledObjectSchemaType
): NormalizedMapObjectProperties => {
    const result: NormalizedMapObjectProperties = {};
    (object.properties ?? []).forEach((property) => {
        result[property.name] = property.value;
    });
    return result;
};

const VALID_MAP_OBJECT_ACTIONS = Object.values(MAP_OBJECT_ACTIONS);

export const ValidatedTiledObjectSchema = TiledObjectSchema.superRefine(
    (object, ctx) => {
        const properties = normalizeMapObjectProperties(object);
        if (!properties.interactable) return;

        const identifier = object.name || String(object.id);

        if (
            !VALID_MAP_OBJECT_ACTIONS.includes(
                properties.action as (typeof VALID_MAP_OBJECT_ACTIONS)[number]
            )
        ) {
            ctx.addIssue({
                code: "custom",
                message: MapObjectErrorMessages.missingAction(identifier),
                path: ["properties", "action"],
            });
            return;
        }

        if (
            properties.action === MAP_OBJECT_ACTIONS.SIT &&
            (properties.seatX == null || properties.seatY == null)
        ) {
            ctx.addIssue({
                code: "custom",
                message: MapObjectErrorMessages.missingSitTarget(identifier),
                path: ["properties"],
            });
        }

        if (
            properties.action === MAP_OBJECT_ACTIONS.TELEPORT &&
            (properties.targetX == null || properties.targetY == null)
        ) {
            ctx.addIssue({
                code: "custom",
                message:
                    MapObjectErrorMessages.missingTeleportTarget(identifier),
                path: ["properties"],
            });
        }
    }
);
