import { NumericFormat } from "react-number-format";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
    id?: string;
    name?: string;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    min?: number;
    max?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export function NumberField({
    id,
    name,
    value,
    onChange,
    min = 0,
    max,
    placeholder,
    disabled,
    className,
}: Props) {
    return (
        <NumericFormat
            id={id}
            name={name}
            customInput={Input}
            decimalScale={0}
            allowNegative={false}
            isAllowed={({ floatValue }) => {
                if (floatValue === undefined) return true;
                if (floatValue < min) return false;
                if (max !== undefined && floatValue > max) return false;
                return true;
            }}
            placeholder={placeholder}
            disabled={disabled}
            value={value ?? ""}
            onValueChange={({ floatValue }) => onChange(floatValue)}
            className={cn(className)}
        />
    );
}
