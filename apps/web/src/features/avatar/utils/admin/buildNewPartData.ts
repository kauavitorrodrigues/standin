import type {
    CreateAvatarPartData,
    CreateAvatarVariationData,
} from "@standin/contracts";
import type {
    CreatePartPageValues,
    CreateSheetFormValues,
} from "../../types/partCreate";
import { normalizeColorHex } from "./normalizeColorHex";

// The color goes as a pair, and only when the form has one. The key is
// derived by the server from the name.
export const buildNewPartData = (
    values: CreatePartPageValues
): CreateAvatarPartData => {
    const data: CreateAvatarPartData = {
        name: values.name.trim(),
        slot: values.slot,
    };
    if (values.colorKey.trim() === "") return data;

    data.colorKey = values.colorKey.trim();
    data.colorHex = normalizeColorHex(values.colorHex);
    return data;
};

export const buildNewColorData = (
    values: CreateSheetFormValues
): CreateAvatarVariationData => ({
    colorKey: values.colorKey.trim(),
    colorHex: normalizeColorHex(values.colorHex),
});
