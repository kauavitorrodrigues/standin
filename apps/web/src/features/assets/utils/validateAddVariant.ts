import {
    ASSET_ACTIONS,
    getFamilyBase,
    isFootprintMaskFitting,
    isFootprintSolidMaskFitting,
    type AssetDefinition,
    type LibraryFamilyDetail,
} from "@standin/contracts";
import { VARIANT_VALIDATION_MESSAGES } from "../consts/variantValidationMessages";
import type { AddVariantFormValues } from "../types/addVariantForm";
import { getVariantKind, VARIANT_KINDS } from "./getVariantKind";
import { validateColorPair } from "./validateColorPair";

type Errors = Partial<Record<keyof AddVariantFormValues, string>>;

const { REQUIRED } = VARIANT_VALIDATION_MESSAGES;

// The target of a teleport: both cells are needed.
const validateTeleportTarget = (values: AddVariantFormValues): Errors => {
    const errors: Errors = {};
    if (values.targetX === undefined) errors.targetX = REQUIRED;
    if (values.targetY === undefined) errors.targetY = REQUIRED;
    return errors;
};

// What a new rotation needs on top of the color: the params of the action of
// the family. A seat needs its seats marked, a teleport needs its target.
const validateActionParams = (
    action: AssetDefinition["action"],
    values: AddVariantFormValues
): Errors => {
    switch (action) {
        case ASSET_ACTIONS.SIT:
            if (values.seats.length > 0) return {};
            return { seats: VARIANT_VALIDATION_MESSAGES.SEATS_REQUIRED };
        case ASSET_ACTIONS.TELEPORT:
            return validateTeleportTarget(values);
        default:
            return {};
    }
};

// What a new rotation needs on top of the color: its own footprint and the
// params of the action.
const validateNewRotation = (
    family: Pick<LibraryFamilyDetail, "variants">,
    values: AddVariantFormValues
): Errors => {
    const errors: Errors = {};
    if (!values.footprintW || values.footprintW <= 0) {
        errors.footprintW = REQUIRED;
    }
    if (!values.footprintH || values.footprintH <= 0) {
        errors.footprintH = REQUIRED;
    }
    const fitsMask = isFootprintMaskFitting({
        w: values.footprintW ?? 0,
        h: values.footprintH ?? 0,
        mask: values.footprintMask,
    });
    if (!fitsMask) {
        errors.footprintMask = VARIANT_VALIDATION_MESSAGES.MASK_NOT_FITTING;
    }
    const base = getFamilyBase(family.variants);
    const fitsSolidMask = isFootprintSolidMaskFitting({
        w: values.footprintW ?? 0,
        h: values.footprintH ?? 0,
        mask: values.footprintMask,
        solidMask: values.footprintSolidMask,
    });
    if (base.solid && base.animation === null && !fitsSolidMask) {
        errors.footprintSolidMask =
            VARIANT_VALIDATION_MESSAGES.SOLID_MASK_NOT_FITTING;
    }
    return { ...errors, ...validateActionParams(base.action, values) };
};

// The color of a family that has color: the key and the hex are both needed.
const validateColor = (values: AddVariantFormValues): Errors => {
    const errors: Errors = {};
    if (values.colorKey.trim() === "") errors.colorKey = REQUIRED;
    if (values.colorHex.trim() === "") errors.colorHex = REQUIRED;
    return errors;
};

// Only what saves a round trip. The API decides the rest (sizes, duplicates).
export const validateAddVariant = (
    family: Pick<LibraryFamilyDetail, "variants" | "colors">,
    values: AddVariantFormValues
): Errors => {
    const errors: Errors = {};
    if (values.image.length === 0) {
        errors.image = VARIANT_VALIDATION_MESSAGES.IMAGE_REQUIRED;
    }
    if (family.colors.length > 0) Object.assign(errors, validateColor(values));
    Object.assign(errors, validateColorPair(values));

    const isNewRotation =
        getVariantKind(family, values.rotation) === VARIANT_KINDS.ROTATION;
    if (isNewRotation)
        Object.assign(errors, validateNewRotation(family, values));

    return errors;
};
