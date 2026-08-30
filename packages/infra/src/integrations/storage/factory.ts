import {
    UnknownStorageDriverError,
    StorageDriverNotImplementedError,
    MissingEnvironmentVariableError,
} from "@standin/contracts";
import { LocalDiskStorageProvider } from "./drivers/local-disk/LocalDiskStorageProvider";
import {
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
            throw new StorageDriverNotImplementedError();
    }
}
