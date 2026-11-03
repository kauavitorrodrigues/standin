import { Input } from "@/components/ui/input";

type Props = {
    value: string;
    onChange: (value: string) => void;
    hasInvalid: boolean;
};

// Several e-mails in one box, separated by comma.
export const EmailsField = ({ value, onChange, hasInvalid }: Props) => (
    <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="exemplo1@email.com, exemplo2@email.com…"
        aria-label="E-mails"
        aria-invalid={hasInvalid}
    />
);
