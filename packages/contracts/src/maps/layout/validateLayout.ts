import {
    MAX_SPACE_CAPACITY,
    MAX_LAYOUT_BYTES,
    MAX_OBJECTS_PER_MAP,
} from "../consts/constants";
import { SIZE_TIERS } from "../consts/size-tiers";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "./consts/issue-messages";
import { LAYOUT_VALIDATION_LEVELS } from "./consts/validation-levels";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutValidationResult,
} from "./issues";
import type { LayoutLibrary } from "./library";
import type { ValidateLayoutContext } from "./types/validate-context";
import type { LooseLayout } from "./types/loose-layout";
import { validateDimensions } from "./validators/validateDimensions";
import { validateHeader } from "./validators/validateHeader";
import { validateTileLayers } from "./validators/validateTileLayers";
import { validateTilesets } from "./validators/validateTilesets";
import { validateZones } from "./validators/validateZones";

export { validateZoneRules } from "./validators/validateZoneRules";

/**
 * Validates a layout. Pure: the library says which tilesets exist, the context
 * says how deep to check. Returns every error and warning, never throws.
 */
export const validateLayout = (
    layout: unknown,
    library: LayoutLibrary,
    context: ValidateLayoutContext
): LayoutValidationResult => {
    const errors: LayoutValidationResult["errors"] = [];
    const warnings: LayoutValidationResult["warnings"] = [];
    const loose = (layout ?? {}) as LooseLayout;

    if (JSON.stringify(layout ?? {}).length > MAX_LAYOUT_BYTES) {
        errors.push(
            createIssue(
                Code.LAYOUT_TOO_LARGE,
                "layout",
                Messages.layoutTooLarge
            )
        );
    }

    if (
        context.level === LAYOUT_VALIDATION_LEVELS.CREATION &&
        context.sizeTier &&
        SIZE_TIERS[context.sizeTier].minPeople > MAX_SPACE_CAPACITY
    ) {
        errors.push(
            createIssue(Code.TIER_DISABLED, "sizeTier", Messages.tierDisabled)
        );
    }

    errors.push(...validateTileLayers(loose, library));

    if (context.level === LAYOUT_VALIDATION_LEVELS.LIGHT)
        return { errors, warnings };

    errors.push(...validateHeader(loose));
    errors.push(...validateDimensions(loose, context.sizeTier));

    const tilesets = validateTilesets(loose, library);
    errors.push(...tilesets.errors);
    warnings.push(...tilesets.warnings);

    const zones = validateZones(loose);
    errors.push(...zones.errors);
    warnings.push(...zones.warnings);

    if ((context.objectCount ?? 0) > MAX_OBJECTS_PER_MAP) {
        errors.push(
            createIssue(
                Code.TOO_MANY_OBJECTS,
                "objects",
                Messages.tooManyObjects
            )
        );
    }

    return { errors, warnings };
};
