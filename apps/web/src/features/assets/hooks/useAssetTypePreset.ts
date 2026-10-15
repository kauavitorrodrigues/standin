import { useEffect, useRef } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { CreateAssetFormValues } from "../types/createForm";
import {
    getAssetTypePreset,
    snapshotPresetFields,
    type PresetValues,
} from "../utils/getAssetTypePreset";

type FieldName = keyof PresetValues;

// Sets the fields of the chosen type (a door is on the ground, not solid, no
// action and animated) and gives back what the user had when another type is
// chosen, so no locked value is left behind. The values live in the form, the
// ref only keeps the ones to restore.
export const useAssetTypePreset = (
    form: UseFormReturn<CreateAssetFormValues>
) => {
    const type = useWatch({ control: form.control, name: "type" });
    const previous = useRef<Partial<PresetValues> | null>(null);

    useEffect(() => {
        const restore = previous.current;
        previous.current = null;
        if (restore) {
            for (const key of Object.keys(restore) as FieldName[]) {
                form.setValue(key, restore[key] as never);
            }
        }

        const preset = getAssetTypePreset(type);
        if (!preset) return;
        previous.current = snapshotPresetFields(form.getValues(), preset);
        for (const key of Object.keys(preset.values) as FieldName[]) {
            form.setValue(key, preset.values[key] as never);
        }
    }, [type, form]);
};
