import { areasTable } from "@standin/database";
import type { AreaDetail } from "@standin/contracts";
import type { LibraryContext, UploadedImage } from "../assets/types";
import { withStoredFile } from "../assets/utils/withStoredFile";
import type { AreaData } from "./types";
import { findScopedArea } from "./utils/findArea";
import { toAreaDetail } from "./utils/toAreaSummary";
import { validateAreaUpload } from "./utils/validateAreaUpload";

/**
 * Creates an area from its native resolution PNG and its stamp. Every problem
 * is collected before anything is written.
 */
export const createArea = async (
    image: UploadedImage,
    data: AreaData,
    { organizationId, createdBy }: LibraryContext
): Promise<AreaDetail> => {
    const { name, stamp } = await validateAreaUpload(image, data);

    const id = await withStoredFile(image, async (tx, fileId) => {
        const [created] = await tx
            .insert(areasTable)
            .values({
                organizationId,
                createdBy,
                name,
                width: stamp.width,
                height: stamp.height,
                objectCount: stamp.objects.length,
                stamp,
                thumbnailFileId: fileId,
            })
            .returning({ id: areasTable.id });
        return created!.id;
    });

    return toAreaDetail(await findScopedArea(id, organizationId));
};
