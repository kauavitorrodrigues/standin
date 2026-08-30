import path from "node:path";
import { randomBytes } from "node:crypto";

export const generateFileName = (originalName: string): string => {
    const extension = path.extname(originalName);
    const uniqueSuffix = `${Date.now()}-${randomBytes(8).toString("hex")}`;
    return `${uniqueSuffix}${extension}`;
};
