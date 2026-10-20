import type { UpdateAvatarPartData } from "@standin/contracts";
import type { EditPartFormValues } from "../../types/parts";

// Only the fields that differ from the part, so the API gets no empty body.
// The color goes as a pair, and only when both fields are filled, because the
// API cannot take a color away from a part.
export const buildPartChanges = (
    initial: EditPartFormValues,
    values: EditPartFormValues
): UpdateAvatarPartData => {
    const changes: UpdateAvatarPartData = {};
    if (values.name !== initial.name) changes.name = values.name;

    const hasColor = values.colorKey !== "" && values.colorHex !== "";
    const colorChanged =
        values.colorKey !== initial.colorKey ||
        values.colorHex !== initial.colorHex;
    if (hasColor && colorChanged) {
        changes.colorKey = values.colorKey;
        changes.colorHex = values.colorHex;
    }
    return changes;
};
