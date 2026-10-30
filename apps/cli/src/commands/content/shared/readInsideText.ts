import path from "node:path";
import { FILE_PROBLEMS } from "../../../consts/messages";
import type {
    CliFiles,
    ContentRoot,
    InsideResult,
    TextReadResult,
} from "../../../types";
import { describeReadFailure } from "../../../utils/describeReadFailure";
import { formatBytes } from "../../../utils/formatBytes";
import { resolveInside } from "./resolveInside";

// The text of a file of the content folder: it has to stay inside the folder,
// and its size is asked before it is read, so a file over the limit is not.
export const readInsideText = async (
    files: CliFiles,
    root: ContentRoot,
    relative: string,
    maxBytes: number
): Promise<TextReadResult> => {
    const inside: InsideResult = await resolveInside(
        files,
        root.real,
        path.join(root.folder, relative)
    );
    if (!inside.ok) return inside;
    try {
        const size: number = await files.fileSize(inside.real);
        if (size > maxBytes) {
            return {
                ok: false,
                problem: FILE_PROBLEMS.tooLarge(
                    formatBytes(size),
                    formatBytes(maxBytes)
                ),
            };
        }
        return { ok: true, text: await files.readText(inside.real) };
    } catch (error) {
        return { ok: false, problem: describeReadFailure(error) };
    }
};
