import path from "node:path";

export const deriveTilesetName = (originalName: string): string =>
    path.basename(originalName, path.extname(originalName));
