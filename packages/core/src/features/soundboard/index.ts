import { createClip } from "./createClip";
import { deleteClip } from "./deleteClip";
import { deleteClipsByOrganizationId } from "./deleteByOrganizationId";
import { findPlayableClip } from "./findPlayableClip";
import { listClips } from "./listClips";
import { updateClip } from "./updateClip";

export const SoundboardService = {
    list: listClips,
    create: createClip,
    update: updateClip,
    delete: deleteClip,
    findPlayable: findPlayableClip,
    deleteByOrganizationId: deleteClipsByOrganizationId,
};

export { canManageClip } from "./utils/canManageClip";
export { readMp3Info } from "./utils/readMp3Info";
export type { ClipFields, SoundboardViewer, SoundboardUpload } from "./types";
