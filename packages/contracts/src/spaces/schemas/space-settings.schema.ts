import { z } from "zod/v4";
import {
    AMBIENT_RANGES,
    DEFAULT_AMBIENT_RANGE,
} from "../../game/consts/ambient";
import {
    DEFAULT_PROXIMITY_PRESET,
    SPACE_PROXIMITY_PRESETS,
} from "../../game/consts/proximity";
import { SpaceErrorMessages } from "./consts/error-messages";

const proximityPreset = z.enum(Object.values(SPACE_PROXIMITY_PRESETS), {
    error: SpaceErrorMessages.settings.proximityPreset.invalid,
});

const ambientRange = z.enum(Object.values(AMBIENT_RANGES), {
    error: SpaceErrorMessages.settings.ambientRange.invalid,
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
    // How far past the proximity ring people overhear the conversations
    // nearby, quieter. Off turns the ring off.
    ambientRange: ambientRange.default(DEFAULT_AMBIENT_RANGE),
    // Off by default: only the owner creates the guest invite link. On, any
    // member of the organization can.
    membersCanInvite: z
        .boolean({ error: SpaceErrorMessages.settings.invalid })
        .default(false),
});

// A partial save: only the keys sent change, the rest keep their value.
// The fields are optional with no default, or an empty save would write them.
export const SpaceSettingsUpdateSchema = z.strictObject({
    enableSendNearbyInMapView: z
        .boolean({ error: SpaceErrorMessages.settings.invalid })
        .optional(),
    proximityPreset: proximityPreset.optional(),
    ambientRange: ambientRange.optional(),
    membersCanInvite: z
        .boolean({ error: SpaceErrorMessages.settings.invalid })
        .optional(),
});

export type SpaceSettingsSchemaType = z.infer<typeof SpaceSettingsSchema>;
export type SpaceSettingsInputSchemaType = z.input<typeof SpaceSettingsSchema>;
export type SpaceSettingsUpdateSchemaType = z.infer<
    typeof SpaceSettingsUpdateSchema
>;
