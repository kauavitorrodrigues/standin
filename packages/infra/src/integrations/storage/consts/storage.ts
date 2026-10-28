export const STORAGE_DRIVERS = {
    LOCAL: "local",
    S3: "s3",
} as const;

export type StorageDriver =
    (typeof STORAGE_DRIVERS)[keyof typeof STORAGE_DRIVERS];

export const DEFAULT_STORAGE_DRIVER: StorageDriver = STORAGE_DRIVERS.LOCAL;

export const LOCAL_STORAGE_DIR = "public";

// Required by MinIO and R2, accepted by AWS S3.
export const S3_FORCE_PATH_STYLE = true;

// R2 ignores the region, and "auto" is what it expects.
export const DEFAULT_S3_REGION = "auto";

// Stored names are uuids that never change, so a browser may keep the object
// for as long as it likes (same policy as the API's `serveFile`).
export const OBJECT_CACHE_CONTROL = "public, max-age=31536000, immutable";
