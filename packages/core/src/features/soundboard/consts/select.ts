import { soundboardClipsTable, usersTable } from "@standin/database";

export const soundboardClipSelect = {
    id: soundboardClipsTable.id,
    name: soundboardClipsTable.name,
    icon: soundboardClipsTable.icon,
    volume: soundboardClipsTable.volume,
    durationMs: soundboardClipsTable.durationMs,
    organizationId: soundboardClipsTable.organizationId,
    fileId: soundboardClipsTable.fileId,
    createdById: soundboardClipsTable.createdById,
    createdByName: usersTable.name,
    updatedAt: soundboardClipsTable.updatedAt,
};
