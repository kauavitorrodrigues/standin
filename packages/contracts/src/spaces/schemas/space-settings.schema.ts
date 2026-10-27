import { z } from "zod/v4";
import { SpaceErrorMessages } from "./consts/error-messages";

// The per-space toggles. Each one has its default here, so a space that never
// saved a setting reads the same value as one that saved the default.
// enableSendNearbyInMapView defaults to true.
export const SpaceSettingsSchema = z.object({
    enableSendNearbyInMapView: z
        .boolean({ error: SpaceErrorMessages.settings.invalid })
        .default(true),
});

// A partial save: only the keys sent change, the rest keep their value.
// The fields are optional with no default, or an empty save would write them.
export const SpaceSettingsUpdateSchema = z.strictObject({
    enableSendNearbyInMapView: z
        .boolean({ error: SpaceErrorMessages.settings.invalid })
        .optional(),
});

export type SpaceSettingsSchemaType = z.infer<typeof SpaceSettingsSchema>;
export type SpaceSettingsInputSchemaType = z.input<typeof SpaceSettingsSchema>;
export type SpaceSettingsUpdateSchemaType = z.infer<
    typeof SpaceSettingsUpdateSchema
>;
