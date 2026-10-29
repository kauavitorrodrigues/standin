import { isSameStoredFile } from "../../library/utils/isSameStoredFile";
import { SeedRepository } from "../repository";

/** Whether the file with this id holds exactly these bytes. */
export const isSameFileById = async (
    fileId: string,
    buffer: Buffer
): Promise<boolean> => {
    const fileName = await SeedRepository.findStoredFileName(fileId);
    return fileName ? isSameStoredFile(fileName, buffer) : false;
};
