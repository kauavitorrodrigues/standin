import { StorageProvider } from "@standin/infra";
import type { MapTemplate } from "@standin/contracts";
import type { SelectedTemplate } from "../types/selected-template";

export const serializeTemplate = async ({
    thumbnailFileName,
    createdAt,
    ...template
}: SelectedTemplate): Promise<MapTemplate> => ({
    ...template,
    createdAt: createdAt.toISOString(),
    thumbnailUrl: thumbnailFileName
        ? await StorageProvider.getUrl(thumbnailFileName)
        : null,
});
