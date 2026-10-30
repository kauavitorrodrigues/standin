import { Controller, type Control } from "react-hook-form";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { SERVICE_TOKEN_SCOPES_TEXT } from "../../consts/messages";
import type { CreateTokenFormValues } from "../../types";
import { ScopesMatrix } from "../views/ScopesMatrix";

type Props = {
    control: Control<CreateTokenFormValues>;
    disabled?: boolean;
};

// The permissions of the token: the matrix with its shortcut buttons.
export const ScopesField = ({ control, disabled }: Props) => (
    <Controller
        control={control}
        name="scopes"
        render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label">
                    {SERVICE_TOKEN_SCOPES_TEXT.LEGEND}
                </FieldLegend>
                <ScopesMatrix
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                />
                <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                />
            </FieldSet>
        )}
    />
);
