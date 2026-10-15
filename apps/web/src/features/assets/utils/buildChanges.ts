import type { UpdateLibraryAssetSchemaType } from "@standin/contracts";
import { NO_VALUE } from "../consts/formFields";
import type { EditAssetFormValues } from "../types/editForm";
import { toRepeat } from "./buildData";

const hasChanged = <K extends keyof EditAssetFormValues>(
    initial: EditAssetFormValues,
    values: EditAssetFormValues,
    ...keys: K[]
) => keys.some((key) => initial[key] !== values[key]);

// Only the fields that differ from the initial values go to the API. The
// frame count is never sent, it cannot change.
export const buildAssetChanges = (
    initial: EditAssetFormValues,
    values: EditAssetFormValues
): UpdateLibraryAssetSchemaType => {
    const changes: UpdateLibraryAssetSchemaType = {};

    if (hasChanged(initial, values, "name")) changes.name = values.name.trim();
    if (hasChanged(initial, values, "category")) {
        changes.category = values.category;
    }
    if (hasChanged(initial, values, "promptText")) {
        changes.promptText =
            values.promptText.trim() === NO_VALUE ? null : values.promptText;
    }
    if (hasChanged(initial, values, "placement")) {
        changes.placement = values.placement;
    }
    if (hasChanged(initial, values, "solid")) changes.solid = values.solid;
    if (hasChanged(initial, values, "surfaceHeightPx")) {
        changes.surfaceHeightPx = values.surfaceHeightPx ?? 0;
    }
    if (
        hasChanged(
            initial,
            values,
            "frameDurationMs",
            "loopForever",
            "repeatCount"
        )
    ) {
        changes.animation = {
            ...(hasChanged(initial, values, "frameDurationMs")
                ? { frameDurationMs: values.frameDurationMs ?? 0 }
                : {}),
            ...(hasChanged(initial, values, "loopForever", "repeatCount")
                ? { repeat: toRepeat(values) }
                : {}),
        };
    }

    return changes;
};
