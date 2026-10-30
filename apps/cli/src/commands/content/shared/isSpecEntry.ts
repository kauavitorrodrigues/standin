import path from "node:path";
import type { FolderEntry } from "../../../types";
import { TEMPLATE_EXTENSIONS } from "../consts";

// A file of templates/ that holds a spec: YAML or JSON, by its extension.
export const isSpecEntry = (entry: FolderEntry): boolean => {
    if (entry.isDirectory) return false;
    return TEMPLATE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase());
};
