import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import type { SoundboardClip } from "@standin/contracts";
import { buildFileUrl } from "../../../lib/buildFileUrl";
import type { SoundboardClipRow, SoundboardViewer } from "../types";
import { canManageClip } from "./canManageClip";

export const toSoundboardClip = (
    row: SoundboardClipRow,
    viewer: SoundboardViewer
): SoundboardClip => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    volume: row.volume,
    durationMs: row.durationMs,
    scope:
        row.organizationId === null
            ? SOUNDBOARD_CLIP_SCOPES.DEFAULT
            : SOUNDBOARD_CLIP_SCOPES.ORGANIZATION,
    fileUrl: buildFileUrl(row.fileId),
    createdByName: row.createdByName ?? "",
    canManage: canManageClip(row, viewer),
    updatedAt: row.updatedAt.getTime(),
});
