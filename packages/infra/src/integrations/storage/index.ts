import path from "node:path";
import {
    createStorageProvider,
    getStorageDriver,
    getLocalStoragePath,
} from "./factory";
import { STORAGE_DRIVERS } from "./consts/storage";

export * from "./types";
export const StorageProvider = createStorageProvider();

export type FileDelivery =
    | { kind: "local-file"; absolutePath: string }
    | { kind: "redirect"; url: string };

/**
 * Decides *how* a file should be served (send it straight from disk vs.
 * redirect to an external URL) based on the active driver, so callers never
 * need to know which driver is configured — they just act on the delivery
 * instruction returned here.
 */
export const resolveFileDelivery = async (
    fileName: string
): Promise<FileDelivery> => {
    if (getStorageDriver() === STORAGE_DRIVERS.LOCAL) {
        return {
            kind: "local-file",
            absolutePath: path.resolve(getLocalStoragePath(), fileName),
        };
    }

    const url = await StorageProvider.getUrl(fileName);
    return { kind: "redirect", url };
};
