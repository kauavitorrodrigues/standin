import path from "node:path";
import { fileSelect } from "../consts/select";
import { generateFileName } from "../utils/generateFileName";
import { db, filesTable } from "@standin/database";
import { StorageProvider } from "@standin/infra";
import type { File, UploadFileInput } from "@standin/contracts";

export const uploadFile = async (file: UploadFileInput): Promise<File> => {
    const fileName = generateFileName(file.originalname);

    await StorageProvider.upload(file.buffer, fileName);

    const [record] = await db
        .insert(filesTable)
        .values({
            originalName: file.originalname,
            fileName,
            extension: path.extname(file.originalname),
            mimeType: file.mimetype,
            sizeInBytes: file.size,
        })
        .returning(fileSelect);

    return record;
};
