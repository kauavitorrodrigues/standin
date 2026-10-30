// What an object written to storage gives back. The `files` row is inserted by
// the caller, inside its own transaction.
export type StoredObject = {
    id: string;
    storageKey: string;
    sizeInBytes: number;
};

export type StoreObjectInput = {
    buffer: Buffer;
    // Folder the object is stored under, e.g. "library" or "soundboard".
    folder: string;
    // With the dot, e.g. ".png".
    extension: string;
    mimeType: string;
};
