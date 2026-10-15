import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { NumberFormField } from "@/components/fields/NumberFormField";

type WithRepeatCount = FieldValues & { repeatCount: number | undefined };

type Props<T extends WithRepeatCount> = {
    control: Control<T>;
    // A loop that never ends has no number of repetitions.
    loopForever: boolean;
    disabled?: boolean;
};

export function RepeatCountField<T extends WithRepeatCount>({
    control,
    loopForever,
    disabled,
}: Props<T>) {
    if (loopForever) return null;

    return (
        <div className="grid grid-cols-2 gap-2">
            <NumberFormField
                control={control}
                name={"repeatCount" as FieldPath<T>}
                label="Repetições"
                hint="Quantas vezes a animação repete antes de parar."
                min={0}
                disabled={disabled}
            />
        </div>
    );
}
