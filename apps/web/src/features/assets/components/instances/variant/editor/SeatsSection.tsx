import type { UseFormReturn } from "react-hook-form";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";
import { SeatsList } from "./SeatsList";

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
    if (!show) return null;

    return (
        <SeatsList
            form={form}
            selected={selected}
            onSelect={onSelect}
            disabled={disabled}
        />
    );
};
