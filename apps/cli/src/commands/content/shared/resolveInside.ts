import path from "node:path";
import { FILE_PROBLEMS } from "../../../consts/messages";
import type { CliFiles, InsideResult } from "../../../types";
import { describeReadFailure } from "../../../utils/describeReadFailure";

// Where a path of the content folder really is, with every link resolved. A
// path that ends outside the folder is refused: the folder is a boundary, and
// a link in it never carries a read out.
export const resolveInside = async (
    files: CliFiles,
    realFolder: string,
    target: string
): Promise<InsideResult> => {
    let real: string;
    try {
        real = await files.realPath(target);
    } catch (error) {
        return { ok: false, problem: describeReadFailure(error) };
    }
    if (real === realFolder || real.startsWith(`${realFolder}${path.sep}`)) {
        return { ok: true, real };
    }
    return { ok: false, problem: FILE_PROBLEMS.outsideFolder };
};
