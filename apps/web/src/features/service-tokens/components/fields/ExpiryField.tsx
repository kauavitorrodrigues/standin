import { Controller, useWatch, type Control } from "react-hook-form";
import { GenericFormField } from "@/components/fields/GenericFormField";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SERVICE_TOKEN_EXPIRY_OPTIONS } from "../../consts/expiryOptions";
import {
    SERVICE_TOKEN_CREATE_TEXT,
    SERVICE_TOKEN_EXPIRY_TEXT,
} from "../../consts/messages";
import type { CreateTokenFormValues, ExpiryOptionId } from "../../types";
import { formatExpiryDay } from "../../utils/formatExpiryDay";
import { resolveExpiryDay } from "../../utils/resolveExpiryDay";

type Props = {
    control: Control<CreateTokenFormValues>;
    disabled?: boolean;
};

const isExpiryOption = (value: unknown): value is ExpiryOptionId =>
    SERVICE_TOKEN_EXPIRY_OPTIONS.some((option) => option.id === value);

// The quick options of the expiry. The date input appears only for the
// specific date. The resulting day sits at the right of the label, so the
// field keeps the height of the name field beside it.
export const ExpiryField = ({ control, disabled }: Props) => {
    const expiry = useWatch({ control, name: "expiry" });
    const expiresOn = useWatch({ control, name: "expiresOn" });
    const day = resolveExpiryDay(expiry, expiresOn);
    const preview = day
        ? SERVICE_TOKEN_EXPIRY_TEXT.preview(formatExpiryDay(day))
        : null;

    return (
        <div className="flex flex-col gap-3">
            <Controller
                control={control}
                name="expiry"
                render={({ field }) => (
                    <Field>
                        <div className="flex items-baseline justify-between gap-2">
                            <FieldLabel htmlFor="expiry">
                                {SERVICE_TOKEN_CREATE_TEXT.EXPIRY_LABEL}
                            </FieldLabel>
                            {preview && (
                                <span
                                    className="text-xs text-muted-foreground"
                                    aria-live="polite"
                                >
                                    {preview}
                                </span>
                            )}
                        </div>
                        <Select
                            value={field.value}
                            disabled={disabled}
                            onValueChange={(next) => {
                                if (isExpiryOption(next)) field.onChange(next);
                            }}
                        >
                            <SelectTrigger id="expiry" className="w-full">
                                <SelectValue>
                                    {(selected: string | null) =>
                                        SERVICE_TOKEN_EXPIRY_OPTIONS.find(
                                            (option) => option.id === selected
                                        )?.label
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {SERVICE_TOKEN_EXPIRY_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.id}
                                        value={option.id}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                )}
            />
            {expiry === "custom" && (
                <GenericFormField
                    control={control}
                    name="expiresOn"
                    label={SERVICE_TOKEN_CREATE_TEXT.EXPIRY_DATE_LABEL}
                    required
                    render={(field) => (
                        <Input
                            {...field}
                            id="expiresOn"
                            type="date"
                            disabled={disabled}
                        />
                    )}
                />
            )}
        </div>
    );
};
