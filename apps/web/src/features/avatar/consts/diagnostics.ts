export const AVATAR_DIAGNOSTIC_MESSAGES = {
    sheetLoadFailed: (fileId: string): string =>
        `[avatar] the sheet ${fileId} did not load, the ghost is shown instead`,
    ghostLoadFailed: (url: string): string =>
        `[avatar] the sheet of the ghost did not load from ${url}`,
} as const;
