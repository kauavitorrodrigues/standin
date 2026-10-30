import type { FakeFiles } from "../types";

// A folder exists when a file is under it, or when a key names it with a
// trailing slash (an empty folder).
export const hasFakeFolder = (files: FakeFiles, path: string): boolean =>
    Object.keys(files).some((key) => key.startsWith(`${path}/`));
