import type {
    CreateVariantData,
    LibraryFamilyDetail,
} from "@standin/contracts";
import { getFamilyBase } from "@standin/contracts";
import type { AddVariantFormValues } from "../types/addVariantForm";
import { buildFootprintMasks } from "./buildFootprintMasks";
import { buildActionParams } from "./buildActionParams";
import { getVariantKind, VARIANT_KINDS } from "./getVariantKind";

type RotationValue = NonNullable<CreateVariantData["rotation"]>;

/**
 * The `data` part of `POST /library/assets/:baseId/variants`. A color on a
 * rotation that exists sends only the color (the server copies the rest, and
 * refuses overrides). A new rotation also sends footprint and actionParams.
 */
export const buildVariantData = (
    family: Pick<LibraryFamilyDetail, "variants">,
    values: AddVariantFormValues
): CreateVariantData => {
    const hasColor = values.colorKey.trim() !== "";
    const data: CreateVariantData = {};

    if (hasColor) {
        data.color = {
            key: values.colorKey.trim(),
            hex: values.colorHex.trim(),
        };
    }
    if (values.rotation !== "") {
        data.rotation = values.rotation as RotationValue;
    }

    if (getVariantKind(family, values.rotation) === VARIANT_KINDS.ROTATION) {
        const base = getFamilyBase(family.variants);
        data.footprint = {
            w: values.footprintW ?? 1,
            h: values.footprintH ?? 1,
            offsetX: values.footprintOffsetX ?? 0,
            ...buildFootprintMasks({
                w: values.footprintW ?? 1,
                h: values.footprintH ?? 1,
                offsetX: values.footprintOffsetX ?? 0,
                mask: values.footprintMask,
                solidMask: values.footprintSolidMask,
                solid: base.solid,
                isAnimated: base.animation !== null,
            }),
        };
        const actionParams = buildActionParams(base.action, values);
        if (actionParams) data.actionParams = actionParams;
    }

    return data;
};
