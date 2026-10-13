import type { UseFormReturn } from "react-hook-form";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";
import { EditorPanel } from "./EditorPanel";

type Props = {
    // The editor shows for a new rotation, once there is an image.
    show: boolean;
    form: UseFormReturn<AddVariantFormValues>;
    file: File | undefined;
    frameCount: number;
    solid: boolean;
    disabled: boolean;
    hasSeats: boolean;
    selectedSeat: number | null;
    onSelectSeat: (index: number | null) => void;
};

export const EditorSection = ({ show, file, ...panelProps }: Props) => {
    if (!show || !file) return null;

    return <EditorPanel file={file} {...panelProps} />;
};
