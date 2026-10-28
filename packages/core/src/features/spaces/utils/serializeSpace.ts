import { StorageProvider } from "@standin/infra";
import type { Space } from "@standin/contracts";
import type { SelectedSpace } from "../types/selected-space";

export const serializeSpace = async ({
    thumbnailFileName,
    createdAt,
    ...space
}: SelectedSpace): Promise<Space> => ({
    ...space,
    createdAt: createdAt.toISOString(),
    thumbnailUrl: thumbnailFileName
        ? await StorageProvider.getUrl(thumbnailFileName)
        : null,
});
