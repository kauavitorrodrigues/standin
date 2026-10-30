import type { Spec, TemplateSpec } from "@standin/authoring";
import { TemplateSpecKindError } from "../../../errors/TemplateSpecKindError";
import type { CliEnv, CliFiles } from "../../../types";
import { TEMPLATE_KIND } from "../../map/consts";
import { loadSpec } from "../../map/shared/loadSpec";

// A spec read for a template: it has to be of kind "template".
export const loadTemplateSpec = async (
    files: CliFiles,
    env: CliEnv,
    specPath: string
): Promise<TemplateSpec> => {
    const spec: Spec = await loadSpec(files, env, specPath);
    if (spec.kind !== TEMPLATE_KIND) throw new TemplateSpecKindError(spec.kind);
    return spec;
};
