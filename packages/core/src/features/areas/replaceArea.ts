import { areasTable, eq } from "@standin/database";
import type { AreaDetail } from "@standin/contracts";
import { FileService } from "../files";
import type { UploadedImage } from "../assets/types";
import { withStoredFile } from "../assets/utils/withStoredFile";
import type { AreaData } from "./types";
import { findScopedArea } from "./utils/findArea";
import { toAreaDetail } from "./utils/toAreaSummary";
import { validateAreaUpload } from "./utils/validateAreaUpload";

/**
 * Replaces the name, the stamp and the thumbnail of an area. The size may
 * change, and the thumbnail then has the new size. The old thumbnail goes away in the same transaction, and
 * `updated_at` moves, since it is the version of the area. Maps that already
 * placed the area keep their copy.
 */
export const replaceArea = async (
    id: string,
    organizationId: string | null,
    image: UploadedImage,
    data: AreaData
): Promise<AreaDetail> => {
    const area = await findScopedArea(id, organizationId);
    const { name, stamp } = await validateAreaUpload(image, data);

    await withStoredFile(image, async (tx, fileId) => {
        await tx
            .update(areasTable)
            .set({
                name,
                stamp,
                width: stamp.width,
                height: stamp.height,
                objectCount: stamp.objects.length,
                thumbnailFileId: fileId,
                updatedAt: new Date(),
            })
            .where(eq(areasTable.id, id));
        await FileService.deleteManyByIds([area.thumbnailFileId], tx);
    });

    return toAreaDetail(await findScopedArea(id, organizationId));
};
