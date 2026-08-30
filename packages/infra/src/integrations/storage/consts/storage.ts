export const STORAGE_DRIVERS = {
    LOCAL: "local",
    S3: "s3",
} as const;

export type StorageDriver =
    (typeof STORAGE_DRIVERS)[keyof typeof STORAGE_DRIVERS];

export const DEFAULT_STORAGE_DRIVER: StorageDriver = STORAGE_DRIVERS.LOCAL;

export const LOCAL_STORAGE_DIR = "public";