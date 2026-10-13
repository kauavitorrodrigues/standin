import { z } from "zod/v4";
import { ASSET_ACTIONS } from "../enums/asset-action";
import { SEAT_FACINGS } from "../enums/tile-category";
import { ActionParamsErrorMessages } from "./consts/error-messages";

export const SitActionParamsSchema = z.object({
    seats: z
        .array(
            z.object({
                dx: z.number({
                    error: ActionParamsErrorMessages.seat.dx.invalid,
                }),
                dy: z.number({
                    error: ActionParamsErrorMessages.seat.dy.invalid,
                }),
                facing: z.enum(SEAT_FACINGS, {
                    error: ActionParamsErrorMessages.seat.facing.invalid,
                }),
            }),
            { error: ActionParamsErrorMessages.seats.invalid }
        )
        .min(1, { error: ActionParamsErrorMessages.seats.required }),
});

export const TeleportActionParamsSchema = z.object({
    targetX: z
        .number({ error: ActionParamsErrorMessages.targetX.invalid })
        .int({ error: ActionParamsErrorMessages.targetX.invalid })
        .min(0, { error: ActionParamsErrorMessages.targetX.invalid }),
    targetY: z
        .number({ error: ActionParamsErrorMessages.targetY.invalid })
        .int({ error: ActionParamsErrorMessages.targetY.invalid })
        .min(0, { error: ActionParamsErrorMessages.targetY.invalid }),
});

export const ACTION_PARAMS_SCHEMAS = {
    [ASSET_ACTIONS.SIT]: SitActionParamsSchema,
    [ASSET_ACTIONS.TELEPORT]: TeleportActionParamsSchema,
} as const;
