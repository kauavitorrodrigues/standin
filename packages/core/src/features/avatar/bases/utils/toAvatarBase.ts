import type { AvatarBase } from "@standin/contracts";
import { buildFileUrl } from "../../../../lib/buildFileUrl";
import type { AvatarBaseRow } from "./types";

export const toAvatarBase = (row: AvatarBaseRow): AvatarBase => ({
    id: row.id,
    key: row.key,
    name: row.name,
    kind: row.kind,
    isDefault: row.isDefault,
    url: buildFileUrl(row.fileId),
    previewUrl:
        row.previewFileId === null ? null : buildFileUrl(row.previewFileId),
    createdAt: row.createdAt.toISOString(),
    deletedAt: row.deletedAt === null ? null : row.deletedAt.toISOString(),
});
