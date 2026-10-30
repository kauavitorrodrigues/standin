import { resolveRemoteTarget } from "../../../config/resolveRemoteTarget";
import { ContentInvalidError } from "../../../errors/ContentInvalidError";
import type {
    CommandContext,
    CommandOutput,
    ContentApplyArgs,
    ContentApplyOptions,
    ContentOutcome,
    ContentScan,
    RemoteTarget,
    StepsProgress,
} from "../../../types";
import { resolveFolder } from "../../../utils/resolveFolder";
import { withProgress } from "../../shared/withProgress";
import { readContentFolder } from "../shared/readContentFolder";
import { applyContent } from "./applyContent";
import { buildContentApplyOutput } from "./buildContentApplyOutput";
import { listPendingUnits } from "./listPendingUnits";

export const runContentApply = async ({
    args,
    env,
    files,
    config,
    http,
}: CommandContext<ContentApplyArgs>): Promise<CommandOutput> => {
    const options: ContentApplyOptions = {
        publish: Boolean(args.publish),
        dryRun: Boolean(args.dryRun),
    };
    const folder: string = resolveFolder(args.folder, env);
    const scan: ContentScan = await readContentFolder(files, folder);
    if (scan.issues.length > 0) throw new ContentInvalidError(scan.issues);

    const target: RemoteTarget = await resolveRemoteTarget(args, env, config);
    const progress: StepsProgress = {
        done: [],
        pending: listPendingUnits(scan.plan),
    };
    const outcome: ContentOutcome = await withProgress(progress, () =>
        applyContent({ http, target, progress }, scan.plan, options)
    );
    return buildContentApplyOutput(folder, scan.plan, outcome, options.dryRun);
};
