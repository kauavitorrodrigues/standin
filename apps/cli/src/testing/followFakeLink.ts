import type { FakeLinks } from "../types";

// Where a path really is when some of its folders, or the file itself, are
// links of the fake file system.
export const followFakeLink = (links: FakeLinks, path: string): string => {
    for (const [from, to] of Object.entries(links)) {
        if (path === from) return to;
        if (path.startsWith(`${from}/`)) {
            return `${to}${path.slice(from.length)}`;
        }
    }
    return path;
};
