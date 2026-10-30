import type { FakeFiles, FakeLinks, FolderEntry } from "../types";

// What is directly inside a folder: the files, the folders they imply and the
// links that stand there.
export const listFakeFolder = (
    files: FakeFiles,
    links: FakeLinks,
    path: string
): FolderEntry[] => {
    const found: Map<string, FolderEntry> = new Map();
    for (const key of Object.keys(files)) {
        if (!key.startsWith(`${path}/`)) continue;
        const rest: string = key.slice(path.length + 1);
        if (rest === "") continue;
        const [first, ...others]: string[] = rest.split("/");
        const isDirectory: boolean = others.length > 0;
        const known: FolderEntry | undefined = found.get(first);
        found.set(first, {
            name: first,
            isDirectory: isDirectory || known?.isDirectory === true,
            isSymlink: false,
        });
    }
    for (const from of Object.keys(links)) {
        if (!from.startsWith(`${path}/`)) continue;
        const name: string = from.slice(path.length + 1);
        if (name.includes("/")) continue;
        found.set(name, { name, isDirectory: false, isSymlink: true });
    }
    return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
};
