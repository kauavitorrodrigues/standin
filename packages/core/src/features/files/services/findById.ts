import { fileSelect } from "../consts/select";
import { db, filesTable, eq, and, isNull } from "@standin/database";
import { FileNotFoundError } from "@standin/contracts";
import type { File } from "@standin/contracts";

export const findFileById = async (id: string): Promise<File> => {
    const [file] = await db
        .select(fileSelect)
        .from(filesTable)
        .where(and(eq(filesTable.id, id), isNull(filesTable.deletedAt)));

    if (!file) throw new FileNotFoundError();

    return file;
};
