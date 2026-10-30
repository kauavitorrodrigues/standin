import type { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type Props = {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    checked: boolean;
    disabled: boolean;
    onChange: (checked: boolean) => void;
};

// One setting, one card: the same look as the switch cards of the forms, which
// are bound to a form and so cannot be used here.
export const SettingSwitchCard = ({
    id,
    icon: Icon,
    title,
    description,
    checked,
    disabled,
    onChange,
}: Props) => (
    <div className="bg-card flex items-start gap-3 rounded-xl border p-4">
        <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor={id} className="text-sm leading-snug font-medium">
                {title}
            </label>
            <p className="text-muted-foreground text-xs leading-relaxed">
                {description}
            </p>
        </div>
        <Switch
            id={id}
            checked={checked}
            disabled={disabled}
            onCheckedChange={onChange}
        />
    </div>
);
