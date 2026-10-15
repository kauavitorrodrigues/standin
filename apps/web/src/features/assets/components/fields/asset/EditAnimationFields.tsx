import type { Control } from "react-hook-form";
import type { EditAssetFormValues } from "@/features/assets/types/editForm";
import { AnimationFields } from "./AnimationFields";

type Props = {
    control: Control<EditAssetFormValues>;
    // Only an animated asset has a strip to describe.
    show: boolean;
    disabled: boolean;
};

// How the strip plays. The frame count never changes, so it is not here.
export const EditAnimationFields = ({ control, show, disabled }: Props) => {
    if (!show) return null;

    return (
        <AnimationFields
            control={control}
            showFrameCount={false}
            disabled={disabled}
        />
    );
};
