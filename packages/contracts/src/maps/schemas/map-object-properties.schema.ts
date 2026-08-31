import { z } from "zod/v4";
import { MAP_OBJECT_ACTIONS } from "../enums/map-object-action";
import { MapObjectPropertiesErrorMessages } from "./consts/error-messages";

const BaseMapObjectPropertiesSchema = z.object({
    solid: z
        .boolean({ error: MapObjectPropertiesErrorMessages.solid.invalid })
        .default(false),
});

export const SitActionPropertiesSchema = BaseMapObjectPropertiesSchema.extend(
    {
        interactable: z.literal(true, {
            error: MapObjectPropertiesErrorMessages.interactable.invalid,
        }),
        action: z.literal(MAP_OBJECT_ACTIONS.SIT, {
            error: MapObjectPropertiesErrorMessages.action.invalid,
        }),
        seatX: z.number({
            error: MapObjectPropertiesErrorMessages.seatX.required,
        }),
        seatY: z.number({
            error: MapObjectPropertiesErrorMessages.seatY.required,
        }),
    },
);

export const TeleportActionPropertiesSchema =
    BaseMapObjectPropertiesSchema.extend({
        interactable: z.literal(true, {
            error: MapObjectPropertiesErrorMessages.interactable.invalid,
        }),
        action: z.literal(MAP_OBJECT_ACTIONS.TELEPORT, {
            error: MapObjectPropertiesErrorMessages.action.invalid,
        }),
        targetX: z.number({
            error: MapObjectPropertiesErrorMessages.targetX.required,
        }),
        targetY: z.number({
            error: MapObjectPropertiesErrorMessages.targetY.required,
        }),
    });

export const NonInteractableMapObjectPropertiesSchema =
    BaseMapObjectPropertiesSchema.extend({
        interactable: z
            .literal(false, {
                error: MapObjectPropertiesErrorMessages.interactable.invalid,
            })
            .optional(),
    });

export const MapObjectPropertiesSchema = z.union([
    SitActionPropertiesSchema,
    TeleportActionPropertiesSchema,
    NonInteractableMapObjectPropertiesSchema,
]);

export type SitActionPropertiesSchemaType = z.infer<
    typeof SitActionPropertiesSchema
>;

export type TeleportActionPropertiesSchemaType = z.infer<
    typeof TeleportActionPropertiesSchema
>;

export type NonInteractableMapObjectPropertiesSchemaType = z.infer<
    typeof NonInteractableMapObjectPropertiesSchema
>;

export type MapObjectPropertiesSchemaType = z.infer<
    typeof MapObjectPropertiesSchema
>;
