import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import type { SoundboardClipScope } from "@standin/contracts";

// The groups of the list, in the order they show.
export const SOUNDBOARD_GROUP_SCOPES: readonly SoundboardClipScope[] = [
    SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
    SOUNDBOARD_CLIP_SCOPES.DEFAULT,
];

export const SOUNDBOARD_DEFAULT_GROUP_LABEL = "Sons padrão";

// Shown while there is no organization name to put on its group.
export const SOUNDBOARD_ORGANIZATION_FALLBACK_LABEL = "Organização";
