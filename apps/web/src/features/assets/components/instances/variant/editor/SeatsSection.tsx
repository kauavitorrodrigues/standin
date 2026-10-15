import { useWatch, type UseFormReturn } from "react-hook-form";
import { SeatsList } from "@/features/assets/components/instances/editor/SeatsList";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";

type Props = {
    // Only a chair with a new rotation has seats to list.
    show: boolean;
    form: UseFormReturn<AddVariantFormValues>;
    selected: number | null;
    onSelect: (index: number | null) => void;
    disabled: boolean;
};

export const SeatsSection = ({
    show,
    form,
    selected,
    onSelect,
    disabled,
}: Props) => {
    const seats = useWatch({ control: form.control, name: "seats" });
    if (!show) return null;

    return (
        <SeatsList
            seats={seats}
            onChange={(next) => {
                form.setValue("seats", next);
                form.clearErrors("seats");
            }}
            selected={selected}
            onSelect={onSelect}
            disabled={disabled}
        />
    );
};
