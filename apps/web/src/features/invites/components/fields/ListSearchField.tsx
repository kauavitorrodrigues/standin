import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

// The one size of the search box in every list of the invites.
export const ListSearchField = ({ value, onChange, className }: Props) => (
    <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar"
        aria-label="Buscar"
        className={cn("w-40 min-w-0 shrink-0", className)}
    />
);
