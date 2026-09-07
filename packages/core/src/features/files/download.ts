import type { Readable } from "node:stream";
import { StorageProvider } from "@standin/infra";

export const downloadFile = (fileName: string): Promise<Readable> =>
    StorageProvider.download(fileName);
