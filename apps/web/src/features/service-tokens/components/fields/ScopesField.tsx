import { Controller, type Control } from "react-hook-form";
import { SERVICE_TOKEN_SCOPES } from "@standin/contracts";
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { SERVICE_TOKEN_SCOPES_TEXT } from "../../consts/messages";
import type { CreateTokenFormValues } from "../../types";
import { ScopePresetBar } from "../views/ScopePresetBar";
import { ScopesTable } from "../views/ScopesTable";

type Props = {
    control: Control<CreateTokenFormValues>;
    disabled?: boolean;
};

// The permissions of the token: shortcuts on top, the table below.
export const ScopesField = ({ control, disabled }: Props) => (
    <Controller
        control={control}
        name="scopes"
        render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label">
                    {SERVICE_TOKEN_SCOPES_TEXT.LEGEND}
                </FieldLegend>
                <ScopePresetBar
                    value={field.value}
                    total={SERVICE_TOKEN_SCOPES.length}
                    onChange={field.onChange}
                    disabled={disabled}
                />
                <ScopesTable
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
