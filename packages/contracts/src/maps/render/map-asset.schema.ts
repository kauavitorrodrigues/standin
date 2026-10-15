import { z } from "zod/v4";
import { MAX_OBJECT_OFFSET } from "../consts/constants";
import { MapAssetErrorMessages as Messages } from "../schemas/consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

const offset = (message: string) =>
    int(message)
        .min(-MAX_OBJECT_OFFSET, { error: message })
        .max(MAX_OBJECT_OFFSET, { error: message });

export const PlaceMapAssetSchema = z.object({
    assetId: z
        .string({ error: Messages.assetId.invalid })
        .min(1, { error: Messages.assetId.invalid }),
    tileX: int(Messages.tile.invalid),
    tileY: int(Messages.tile.invalid),
    offsetX: offset(Messages.offset.invalid).optional(),
    offsetY: offset(Messages.offset.invalid).optional(),
    parentId: z.string({ error: Messages.parentId.invalid }).optional(),
});

export const UpdateMapAssetSchema = z
    .object({
        tileX: int(Messages.tile.invalid).optional(),
        tileY: int(Messages.tile.invalid).optional(),
        offsetX: offset(Messages.offset.invalid).optional(),
        offsetY: offset(Messages.offset.invalid).optional(),
        // Null detaches the object from its parent.
        parentId: z
            .string({ error: Messages.parentId.invalid })
            .nullable()
            .optional(),
        // Replaces the asset keeping the row, the desk link and the children.
        assetId: z.string({ error: Messages.assetId.invalid }).optional(),
        // Marks the swap as a color change: the target must be a colored
        // sibling of the same family and rotation.
        colorChange: z.boolean().optional(),
    })
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        {
            error: Messages.changes.required,
        }
    );

export const DeleteMapAssetQuerySchema = z.object({
    releaseDesk: z
        .enum(["true", "false"], { error: Messages.releaseDesk.invalid })
        .optional()
        .transform((value) => value === "true"),
});

export const ClaimDeskSchema = z.object({
    swap: z.boolean({ error: Messages.swap.invalid }).optional(),
});

export const AssignDeskSchema = z.object({
    userId: z
        .string({ error: Messages.userId.invalid })
        .min(1, { error: Messages.userId.invalid }),
});

export type PlaceMapAssetSchemaType = z.infer<typeof PlaceMapAssetSchema>;
export type UpdateMapAssetSchemaType = z.infer<typeof UpdateMapAssetSchema>;
