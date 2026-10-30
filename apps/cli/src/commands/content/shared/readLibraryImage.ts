import path from "node:path";
import { MAX_UPLOAD_BYTES } from "@standin/contracts";
import type {
    CliFiles,
    ContentRoot,
    InsideResult,
    LibraryFileRef,
    LibraryImageRead,
    PngReadResult,
} from "../../../types";
import { checkLibraryPath } from "./checkLibraryPath";
import { readPngFile } from "../../../utils/readPngFile";
import { resolveInside } from "./resolveInside";

// One PNG library.json names, read from the folder. The part keeps the path
// as library.json writes it; the file is found by joining it to the folder,
// and has to stay inside it once links are resolved. Nothing is read when the
// name or the path is already refused.
export const readLibraryImage = async (
    files: CliFiles,
    root: ContentRoot,
    ref: LibraryFileRef
): Promise<LibraryImageRead> => {
    const refused: string | undefined = checkLibraryPath(ref.file);
    if (refused) {
        return {
            ok: false,
            issue: { file: ref.file, path: ref.path, message: refused },
        };
    }

    const inside: InsideResult = await resolveInside(
        files,
        root.real,
        path.join(root.folder, ref.file)
    );
    if (!inside.ok) {
        return {
            ok: false,
            issue: { file: ref.file, path: ref.path, message: inside.problem },
        };
    }
    const read: PngReadResult = await readPngFile(
        files,
        inside.real,
        MAX_UPLOAD_BYTES
    );
    if (!read.ok) {
        return {
            ok: false,
            issue: { file: ref.file, path: ref.path, message: read.problem },
        };
    }
    return { ok: true, image: { file: ref.file, bytes: read.bytes } };
};
