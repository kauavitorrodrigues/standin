import { z } from "zod/v4";
import {
    DEFAULT_PROXIMITY_PRESET,
    SPACE_PROXIMITY_PRESETS,
} from "../../game/consts/proximity";
import { SpaceErrorMessages } from "./consts/error-messages";

const proximityPreset = z.enum(Object.values(SPACE_PROXIMITY_PRESETS), {
    error: SpaceErrorMessages.settings.proximityPreset.invalid,
});

// The per-space toggles. Each one has its default here, so a space that never
// saved a setting reads the same value as one that saved the default.
// enableSendNearbyInMapView defaults to true.
export const SpaceSettingsSchema = z.object({
    enableSendNearbyInMapView: z
        .boolean({ error: SpaceErrorMessages.settings.invalid })
        .default(true),
    // How far people hear and see each other. Short is a close conversation,
    // Long is a whole room.
    proximityPreset: proximityPreset.default(DEFAULT_PROXIMITY_PRESET),
});

// A partial save: only the keys sent change, the rest keep their value.
// The fields are optional with no default, or an empty save would write them.
export const SpaceSettingsUpdateSchema = z.strictObject({
    enableSendNearbyInMapView: z
        .boolean({ error: SpaceErrorMessages.settings.invalid })
        .optional(),
    proximityPreset: proximityPreset.optional(),
});

export type SpaceSettingsSchemaType = z.infer<typeof SpaceSettingsSchema>;
export type SpaceSettingsInputSchemaType = z.input<typeof SpaceSettingsSchema>;
export type SpaceSettingsUpdateSchemaType = z.infer<
    typeof SpaceSettingsUpdateSchema
>;
