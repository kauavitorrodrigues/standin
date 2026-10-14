import { useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { VARIANT_EDITORS, type VariantEditor } from "../consts/variantEditors";
import type { CreateAssetFormValues } from "../types/createForm";
import type { Seat } from "../types/seat";

// The seats of a new asset, kept in the fields of the form, with the seat
// picked on the image and the editor tab the user is on.
export const useAssetSeats = (form: UseFormReturn<CreateAssetFormValues>) => {
    const seats = useWatch({ control: form.control, name: "seats" });
    const [selected, setSelected] = useState<number | null>(null);
    const [picked, setPicked] = useState<VariantEditor>(
        VARIANT_EDITORS.FOOTPRINT
    );

    const setSeats = (next: Seat[]) => {
        form.setValue("seats", next);
        form.clearErrors("seats");
    };

    const clearSeats = () => {
        setSeats([]);
        setSelected(null);
    };

    return {
        seats,
        setSeats,
        clearSeats,
        selected,
        setSelected,
        picked,
        setPicked,
    };
};
