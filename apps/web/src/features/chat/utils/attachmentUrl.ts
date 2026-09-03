import type { File as FileRecord } from "@standin/contracts";

export const resolveAttachmentUrl = (file: FileRecord) =>
    `${import.meta.env.VITE_BASE_API_URL}/public/${file.fileName}`;
