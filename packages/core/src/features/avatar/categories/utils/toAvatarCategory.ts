import type { AvatarCategory } from "@standin/contracts";
import { buildFileUrl } from "../../../../lib/buildFileUrl";
import type { AvatarCategoryRow } from "./findCategoryRow";

export const toAvatarCategory = (row: AvatarCategoryRow): AvatarCategory => ({
    slot: row.slot,
    name: row.name,
    sortOrder: row.sortOrder,
    previewUrl:
        row.previewFileId === null ? null : buildFileUrl(row.previewFileId),
});
