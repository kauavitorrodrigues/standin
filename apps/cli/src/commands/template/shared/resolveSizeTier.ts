import type { TemplateSpec } from "@standin/authoring";
import type { MapSizeTier } from "@standin/contracts";
import { SizeTierMissingError } from "../../../errors/SizeTierMissingError";
import { TemplateSizeTierMismatchError } from "../../../errors/TemplateSizeTierMismatchError";

// The size tier of a template: --size-tier, or the one of the spec when the
// flag is left out. When both are given they have to be the same.
export const resolveSizeTier = (
    option: MapSizeTier | undefined,
    spec: TemplateSpec | undefined
): MapSizeTier => {
    if (!spec) {
        if (!option) throw new SizeTierMissingError();
        return option;
    }
    if (option && option !== spec.sizeTier) {
        throw new TemplateSizeTierMismatchError(spec.sizeTier, option);
    }
    return spec.sizeTier;
};
