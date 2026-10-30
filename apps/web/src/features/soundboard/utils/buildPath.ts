import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import type { SoundboardClipScope } from "@standin/contracts";
import type { ClipListSource } from "../types/library";

const DEFAULT_CLIPS_PATH = "/soundboard/default-clips";

const buildOrganizationClipsPath = (organizationId: string): string =>
    `/organizations/${organizationId}/soundboard/clips`;

/**
 * Where a library is listed. An organization lists through its own route,
 * which returns both scopes, and the admin through the default clips one.
 */
export const buildListPath = ({
    kind,
    organizationId,
}: ClipListSource): string => {
    if (kind === "admin") return DEFAULT_CLIPS_PATH;
    return buildOrganizationClipsPath(organizationId);
};

/**
 * Where the clips of a scope are managed. The default clips have their own
 * mount for the platform admin, the organization ones live under the
 * organization.
 */
export const buildClipsPath = (
    scope: SoundboardClipScope,
    organizationId: string
): string =>
    scope === SOUNDBOARD_CLIP_SCOPES.DEFAULT
        ? DEFAULT_CLIPS_PATH
        : buildOrganizationClipsPath(organizationId);
