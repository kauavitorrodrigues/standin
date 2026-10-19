import { useEffect } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import {
    getFileBaseName,
    toDisplayName,
} from "@/features/assets/utils/deriveAssetNames";
import type { CreatePartPageValues } from "../../types/partCreate";

// The name of the part starts from the name of the front file. A field the
// person edited is left alone. The key is derived by the server from the
// name.
export const useSuggestPartName = (
    form: UseFormReturn<CreatePartPageValues>
) => {
    const [images] = useWatch({
        control: form.control,
        name: ["image"],
    });
    const file = images[0] ?? null;
    const { dirtyFields } = form.formState;
    const isNameEdited = Boolean(dirtyFields.name);

    useEffect(() => {
        if (!file || isNameEdited) return;
        form.setValue("name", toDisplayName(getFileBaseName(file.name)));
    }, [file, isNameEdited, form]);
};
