import { db, filesTable, and, eq, isNull } from "@standin/database";
import type { Space } from "@standin/contracts";
import type { ReturnedSpace } from "../types/selected-space";
import { serializeSpace } from "./serializeSpace";

// A space without a thumbnail, which is most of them, costs no extra query.
const findFileName = async (fileId: string | null): Promise<string | null> => {
    if (!fileId) return null;

    const [file] = await db
        .select({ fileName: filesTable.fileName })
        .from(filesTable)
        .where(and(eq(filesTable.id, fileId), isNull(filesTable.deletedAt)));

    return file?.fileName ?? null;
};

export const serializeReturnedSpace = async ({
    thumbnailFileId,
    ...space
}: ReturnedSpace): Promise<Space> =>
    serializeSpace({
        ...space,
        thumbnailFileName: await findFileName(thumbnailFileId),
    });

// For a space that has no photo, or whose photo was removed with it.
export const serializeSpaceWithoutThumbnail = async ({
    thumbnailFileId: _fileId,
    ...space
}: ReturnedSpace): Promise<Space> =>
    serializeSpace({ ...space, thumbnailFileName: null });
