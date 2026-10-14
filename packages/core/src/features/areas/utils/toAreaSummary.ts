import type { AreaDetail, AreaSummary } from "@standin/contracts";
import { buildFileUrl } from "../../../lib/buildFileUrl";
import type { AreaRow } from "../types";

export const toAreaSummary = (row: AreaRow): AreaSummary => ({
    id: row.id,
    name: row.name,
    width: row.width,
    height: row.height,
    objectCount: row.objectCount,
    thumbnailUrl: buildFileUrl(row.thumbnailFileId),
    createdBy: row.createdBy ?? "",
    updatedAt: row.updatedAt.getTime(),
});

export const toAreaDetail = (row: AreaRow): AreaDetail => ({
    ...toAreaSummary(row),
    stamp: row.stamp,
});
