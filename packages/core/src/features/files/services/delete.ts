import { fileSelect } from "../consts/select";
import { db, filesTable, eq, and, isNull } from "@standin/database";
import { StorageProvider } from "@standin/infra";
import { FileNotFoundError } from "@standin/contracts";
import type { File } from "@standin/contracts";

export const deleteFile = async (id: string): Promise<File> => {
    const [file] = await db
        .select(fileSelect)
        .from(filesTable)
        .where(and(eq(filesTable.id, id), isNull(filesTable.deletedAt)));

    if (!file) throw new FileNotFoundError();

    await StorageProvider.delete(file.fileName);

    const [deleted] = await db
        .update(filesTable)
        .set({ deletedAt: new Date() })
        .where(eq(filesTable.id, id))
        .returning(fileSelect);

    return deleted;
};
