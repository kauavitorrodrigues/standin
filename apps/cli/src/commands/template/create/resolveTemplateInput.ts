import type { MapSizeTier } from "@standin/contracts";
import { TemplateNameInvalidError } from "../../../errors/TemplateNameInvalidError";
import { PublishNeedsThumbnailError } from "../../../errors/PublishNeedsThumbnailError";
import type {
    CliEnv,
    CliFiles,
    PngFile,
    TemplateCreateArgs,
    TemplateInput,
} from "../../../types";
import { checkTemplateName } from "../shared/checkTemplateName";
import { loadTemplateSpec } from "../shared/loadTemplateSpec";
import { readThumbnail } from "../shared/readThumbnail";
import { resolveSizeTier } from "../shared/resolveSizeTier";
import type { TemplateSpec } from "@standin/authoring";

// What the flags describe, read and checked here, with no network: the spec,
// the thumbnail and the size tier.
export const resolveTemplateInput = async (
    args: TemplateCreateArgs,
    env: CliEnv,
    files: CliFiles
): Promise<TemplateInput> => {
    if (args.publish && !args.thumbnail) {
        throw new PublishNeedsThumbnailError();
    }
    const nameProblem: string | undefined = checkTemplateName(args.name);
    if (nameProblem) throw new TemplateNameInvalidError(nameProblem);

    let spec: TemplateSpec | undefined;
    if (args.spec) spec = await loadTemplateSpec(files, env, args.spec);
    let thumbnail: PngFile | undefined;
    if (args.thumbnail) {
        thumbnail = await readThumbnail(files, env, args.thumbnail);
    }
    const sizeTier: MapSizeTier = resolveSizeTier(args.sizeTier, spec);

    return {
        name: args.name,
        description: args.description,
        sizeTier,
        spec,
        thumbnail,
        publish: Boolean(args.publish),
    };
};
