import { ContentInvalidError } from "../../../errors/ContentInvalidError";
import type {
    CommandContext,
    CommandOutput,
    ContentScan,
    ContentValidateArgs,
} from "../../../types";
import { resolveFolder } from "../../../utils/resolveFolder";
import { readContentFolder } from "../shared/readContentFolder";
import { buildContentValidateOutput } from "./buildContentValidateOutput";

export const runContentValidate = async ({
    args,
    env,
    files,
}: CommandContext<ContentValidateArgs>): Promise<CommandOutput> => {
    const folder: string = resolveFolder(args.folder, env);
    const scan: ContentScan = await readContentFolder(files, folder);
    if (scan.issues.length > 0) throw new ContentInvalidError(scan.issues);
    return buildContentValidateOutput(folder, scan.plan);
};
