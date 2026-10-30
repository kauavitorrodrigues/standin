// One entry of a folder.
export type FolderEntry = {
    name: string;
    isDirectory: boolean;
    // A link is not followed by the listing: `isDirectory` is false for it.
    isSymlink: boolean;
};

// The reads of the file system a command needs, behind a seam.
export type CliFiles = {
    readText: (path: string) => Promise<string>;
    readBytes: (path: string) => Promise<Uint8Array>;
    // The entries of a folder, sorted by name.
    listDir: (path: string) => Promise<FolderEntry[]>;
    // The size of a file in bytes, without reading it.
    fileSize: (path: string) => Promise<number>;
    // The path with every link resolved.
    realPath: (path: string) => Promise<string>;
};

// A PNG read from the disk and checked: its bytes, or why it cannot be used.
export type PngReadResult =
    { ok: true; bytes: Uint8Array } | { ok: false; problem: string };

// A path inside the content folder, checked: where it really is, or why it
// cannot be used.
export type InsideResult =
    { ok: true; real: string } | { ok: false; problem: string };

// The text of a file read from the content folder, or why it cannot be used.
export type TextReadResult =
    { ok: true; text: string } | { ok: false; problem: string };
