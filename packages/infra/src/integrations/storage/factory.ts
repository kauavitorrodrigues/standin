import {
    UnknownStorageDriverError,
    MissingEnvironmentVariableError,
} from "@standin/contracts";
import { requireEnv } from "./utils/requireEnv";
import { requireUrlEnv } from "./utils/requireUrlEnv";
import { LocalDiskStorageProvider } from "./drivers/local-disk/LocalDiskStorageProvider";
import { S3CompatibleStorageProvider } from "./drivers/s3-compatible/S3CompatibleStorageProvider";
import {
    DEFAULT_S3_REGION,
    DEFAULT_STORAGE_DRIVER,
    LOCAL_STORAGE_DIR,
    STORAGE_DRIVERS,
} from "./consts/storage";
import type { StorageDriver } from "./consts/storage";
import type { StorageProvider } from "./types";

const isStorageDriver = (value: string): value is StorageDriver =>
    (Object.values(STORAGE_DRIVERS) as string[]).includes(value);

export const getStorageDriver = (): StorageDriver => {
    const value = process.env.STORAGE_DRIVER || DEFAULT_STORAGE_DRIVER;
    if (!isStorageDriver(value)) throw new UnknownStorageDriverError();
    return value;
};

export const getLocalStoragePath = (): string => LOCAL_STORAGE_DIR;

export const getServerUrl = (): string => {
    const value = process.env.SERVER_URL;
    if (!value) throw new MissingEnvironmentVariableError("SERVER_URL");
    return value;
};

export function createStorageProvider(): StorageProvider {
    const driver = getStorageDriver();

    switch (driver) {
        case STORAGE_DRIVERS.LOCAL:
            return new LocalDiskStorageProvider(
                getLocalStoragePath(),
                getServerUrl()
            );
        case STORAGE_DRIVERS.S3:
            // Read when the provider is built, which happens on import, so a
            // missing variable stops the API at boot instead of on the first
            // upload.
            return new S3CompatibleStorageProvider({
                endpoint: requireUrlEnv("S3_ENDPOINT", { rootOnly: true }),
                region: process.env.S3_REGION?.trim() || DEFAULT_S3_REGION,
                bucket: requireEnv("S3_BUCKET"),
                accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
                secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
                publicUrl: requireUrlEnv("S3_PUBLIC_URL"),
            });
    }
}
