// What a creation service receives besides the validated `data`.
export type UploadedImage = {
    buffer: Buffer;
    originalName?: string;
};

export type LibraryContext = {
    // Only the global library (null) exists for now.
    organizationId: string | null;
    createdBy: string;
};
