import path from "node:path";
import { v7 as uuidv7 } from "uuid";
import { fileSelect } from "./consts/select";
import { buildStorageKey } from "./utils/buildStorageKey";
import { db, filesTable } from "@standin/database";
import { StorageProvider } from "@standin/infra";
import type { File, UploadFileInput } from "@standin/contracts";

type UploadFileOptions = {
    // Folder the file is stored under, e.g. "maps/<mapId>" or "tilesets".
    folder: string;
    // File row id, and the storage base name when `fileName` isn't set.
    // Defaults to a fresh id so callers only need to pass it when the id
    // must be known before the file record is inserted (e.g. to fold it
    // into the folder path).
    id?: string;
    // Storage base name (without extension). Defaults to `id`.
    fileName?: string;
};

export const uploadFile = async (
    file: UploadFileInput,
    { folder, id = uuidv7(), fileName }: UploadFileOptions
): Promise<File> => {
    const storageKey = buildStorageKey(
        folder,
        fileName ?? id,
        file.originalname
    );

    await StorageProvider.upload(file.buffer, storageKey);

    const [record] = await db
        .insert(filesTable)
        .values({
            id,
            originalName: file.originalname,
            fileName: storageKey,
            extension: path.extname(file.originalname),
            mimeType: file.mimetype,
            sizeInBytes: file.size,
        })
        .returning(fileSelect);

    return record;
};
