import type { ReactNode } from "react";
import {
    type Control,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { ColorFormField } from "@/components/fields/ColorFormField";
import { TextFormField } from "@/components/fields/TextFormField";

type WithColor = FieldValues & { colorKey: string; colorHex: string };

type Props<T extends WithColor> = {
    control: Control<T>;
    disabled?: boolean;
    required?: boolean;
    hint: string;
    // A field that goes first in the same row, like the rotation of a
    // variation.
    leading?: ReactNode;
};

// The color of an asset: a name for the key and the hex picked on the color
// picker, shown as the circle in the palette. The two go together.
export function ColorFields<T extends WithColor>({
    control,
    disabled,
    required,
    hint,
    leading,
}: Props<T>) {
    return (
        <div
            className={cn(
                "grid items-start gap-2",
                leading ? "grid-cols-[10rem_1fr_auto]" : "grid-cols-[1fr_auto]"
            )}
        >
            {leading}
            <TextFormField
                control={control}
                name={"colorKey" as FieldPath<T>}
                label="Cor"
                hint={hint}
                required={required}
                placeholder="vermelho"
                disabled={disabled}
            />
            <ColorFormField
                control={control}
                name={"colorHex" as FieldPath<T>}
                label="Tom"
                required={required}
                disabled={disabled}
            />
        </div>
    );
}
