import path from "node:path";

export const buildStorageKey = (
    folder: string,
    baseName: string,
    originalName: string
): string => {
    const extension = path.extname(originalName);
    return `${folder}/${baseName}${extension}`;
};
