import type { AvatarSlot } from "../enums/slots";

// A part with its color variations. Picking a family and then one of its
// variations is how a random avatar gets a color.
export type AvatarRandomFamily = {
    variationIds: readonly string[];
};

export type AvatarRandomSlot = {
    slot: AvatarSlot;
    families: readonly AvatarRandomFamily[];
};

// What `randomAvatarConfig` draws from: the slots in drawing priority order
// and the base the avatar will use, null for the default one.
export type AvatarRandomCatalog = {
    baseId: string | null;
    slots: readonly AvatarRandomSlot[];
};
