import {
    useWatch,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";
import { MAX_SPACE_NAME_LENGTH } from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { fieldName } from "@/lib/forms";

type SpaceFormValues = { name: string };

type Props<TFieldValues extends FieldValues & SpaceFormValues> = {
    form: UseFormReturn<TFieldValues>;
    disabled: boolean;
};

// The fields both the create and the update form of a space share.
export function SpaceFormFields<
    TFieldValues extends FieldValues & SpaceFormValues,
>({ form, disabled }: Props<TFieldValues>) {
    const name = fieldName<TFieldValues, SpaceFormValues>();
    const value = useWatch({ control: form.control, name: name("name") });

    return (
        <div className="flex flex-col gap-1">
            <TextFormField
                control={form.control}
                name={name("name")}
                label="Nome"
                required
                placeholder="Nome do espaço"
                disabled={disabled}
                maxLength={MAX_SPACE_NAME_LENGTH}
            />
            <span className="self-end text-xs text-muted-foreground">
                {String(value ?? "").length}/{MAX_SPACE_NAME_LENGTH}
            </span>
        </div>
    );
}
