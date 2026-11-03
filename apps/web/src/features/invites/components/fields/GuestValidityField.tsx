import { CalendarClockIcon } from "lucide-react";
import { GUEST_VALIDITY_OPTIONS_HOURS } from "@standin/contracts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { NO_VALIDITY, VALIDITY_LABELS } from "../../consts/validity";
import { toValidityHours, toValidityValue } from "../../utils/validity";

const VALIDITY_VALUES = [
    NO_VALIDITY,
    ...GUEST_VALIDITY_OPTIONS_HOURS.map(String),
];

type Props = {
    // Undefined while the link loads.
    hours: number | null | undefined;
    onChange: (hours: number | null) => void;
};

// How long an admitted guest keeps the access. Same card as the switch cards,
// with the select on the right in place of the switch.
export const GuestValidityField = ({ hours, onChange }: Props) => (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <CalendarClockIcon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm leading-snug font-medium">
                Validade do acesso
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
                Quanto tempo o convidado fica depois de admitido.
            </p>
        </div>
        <Select
            value={toValidityValue(hours)}
            onValueChange={(value) => {
                if (value !== null) onChange(toValidityHours(value));
            }}
            disabled={hours === undefined}
        >
            <SelectTrigger
                aria-label="Validade do acesso"
                className="w-36 shrink-0"
            >
                <SelectValue>
                    {(value: string) => VALIDITY_LABELS[value] ?? value}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {VALIDITY_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                        {VALIDITY_LABELS[value]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);
