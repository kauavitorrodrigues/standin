import fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import type { CliFiles, FolderEntry } from "../types";

export const createNodeFiles = (): CliFiles => ({
    readText: (path) => fs.readFile(path, "utf8"),
    readBytes: (path) => fs.readFile(path),
    listDir: async (path) => {
        const entries: Dirent[] = await fs.readdir(path, {
            withFileTypes: true,
        });
        const listed: FolderEntry[] = entries.map((entry) => ({
            name: entry.name,
            isDirectory: entry.isDirectory(),
            isSymlink: entry.isSymbolicLink(),
        }));
        return listed.sort((a, b) => a.name.localeCompare(b.name));
    },
    fileSize: async (path) => (await fs.stat(path)).size,
    realPath: (path) => fs.realpath(path),
});
