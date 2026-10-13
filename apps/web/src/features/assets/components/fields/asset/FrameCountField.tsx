import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { MIN_ANIMATION_FRAME_COUNT } from "@standin/contracts";
import { NumberFormField } from "@/components/fields/NumberFormField";

type WithFrameCount = FieldValues & { frameCount?: number | undefined };

type Props<T extends WithFrameCount> = {
    control: Control<T>;
    // The frame count is chosen once, when the asset is created.
    show: boolean;
    disabled?: boolean;
};

export function FrameCountField<T extends WithFrameCount>({
    control,
    show,
    disabled,
}: Props<T>) {
    if (!show) return null;

    return (
        <NumberFormField
            control={control}
            name={"frameCount" as FieldPath<T>}
            label="Frames"
            hint="Quantos frames a faixa horizontal do PNG tem, lado a lado, todos do mesmo tamanho. Não muda depois de criado."
            required
            min={MIN_ANIMATION_FRAME_COUNT}
            disabled={disabled}
        />
    );
}
