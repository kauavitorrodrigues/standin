import path from "node:path";
import { MAX_THUMBNAIL_SIZE_IN_BYTES } from "@standin/contracts";
import type {
    CliFiles,
    ContentRoot,
    InsideResult,
    PngReadResult,
    TemplateThumbnailRead,
} from "../../../types";
import { readPngFile } from "../../../utils/readPngFile";
import { TEMPLATES_FOLDER } from "../consts";
import { resolveInside } from "./resolveInside";

// The PNG beside a spec, read from inside the folder.
export const readTemplateThumbnail = async (
    files: CliFiles,
    root: ContentRoot,
    pngName: string
): Promise<TemplateThumbnailRead> => {
    const file: string = `${TEMPLATES_FOLDER}/${pngName}`;
    const inside: InsideResult = await resolveInside(
        files,
        root.real,
        path.join(root.folder, file)
    );
    if (!inside.ok) return { issues: [{ file, message: inside.problem }] };

    const read: PngReadResult = await readPngFile(
        files,
        inside.real,
        MAX_THUMBNAIL_SIZE_IN_BYTES
    );
    if (read.ok) return { thumbnail: { file, bytes: read.bytes }, issues: [] };
    return { issues: [{ file, message: read.problem }] };
};
