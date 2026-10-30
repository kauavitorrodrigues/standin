import { parseSpec, validateSpec } from "@standin/authoring";
import type {
    ParseSpecResult,
    Spec,
    ValidateSpecResult,
} from "@standin/authoring";
import { SpecInvalidError } from "../../../errors/SpecInvalidError";
import { SpecKindUnsupportedError } from "../../../errors/SpecKindUnsupportedError";
import type { CliEnv, CliFiles } from "../../../types";
import { resolveFolder } from "../../../utils/resolveFolder";
import { AREA_KIND } from "../consts";
import { readSpecText } from "./readSpecText";

// Reads the file and checks it against the spec schema, all local. A spec that
// builds an area is refused: it does not describe the layout of a map.
export const loadSpec = async (
    files: CliFiles,
    env: CliEnv,
    specPath: string
): Promise<Spec> => {
    const text: string = await readSpecText(
        files,
        resolveFolder(specPath, env)
    );

    const parsed: ParseSpecResult = parseSpec(text);
    if (!parsed.ok) throw new SpecInvalidError(parsed.issues);

    const checked: ValidateSpecResult = validateSpec(parsed.value);
    if (!checked.ok) throw new SpecInvalidError(checked.issues);

    if (checked.spec.kind === AREA_KIND) {
        throw new SpecKindUnsupportedError(checked.spec.kind);
    }
    return checked.spec;
};
