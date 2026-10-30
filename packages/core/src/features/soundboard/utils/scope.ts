import { soundboardClipsTable, and, eq, isNull, or } from "@standin/database";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import type { SoundboardClipScope } from "@standin/contracts";

const inOrganization = (organizationId: string) =>
    eq(soundboardClipsTable.organizationId, organizationId);

const isDefault = () => isNull(soundboardClipsTable.organizationId);

/**
 * The live clips a person may see. With no organization only the default
 * clips match. `scope` narrows to one section of the panel.
 */
export const visibleClips = (
    organizationId: string | null,
    scope?: SoundboardClipScope
) => {
    const live = isNull(soundboardClipsTable.deletedAt);
    if (organizationId === null) return and(live, isDefault());

    switch (scope) {
        case SOUNDBOARD_CLIP_SCOPES.ORGANIZATION:
            return and(live, inOrganization(organizationId));
        case SOUNDBOARD_CLIP_SCOPES.DEFAULT:
            return and(live, isDefault());
        default:
            return and(live, or(inOrganization(organizationId), isDefault()));
    }
};
