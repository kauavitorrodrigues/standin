import type { ClipOwnership, SoundboardViewer } from "../types";

/**
 * Default clips (no organization) belong to the platform admin. A clip of an
 * organization is changed by the owner of that organization and by the member
 * who uploaded it.
 */
export const canManageClip = (
    clip: ClipOwnership,
    viewer: SoundboardViewer
): boolean => {
    if (clip.organizationId === null) return viewer.isPlatformAdmin;
    return viewer.isOrganizationOwner || clip.createdById === viewer.userId;
};
