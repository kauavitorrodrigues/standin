import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Props = {
    icon: LucideIcon;
    color?: string;
    label: string;
    children: ReactNode;
};

// One property of the family in the panel: what it is and its value.
export const DetailsRow = ({ icon: Icon, color, label, children }: Props) => (
    <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground flex items-center gap-2">
            <Icon className="size-4 shrink-0" style={{ color }} />
            {label}
        </span>
        <span className="truncate text-right font-medium">{children}</span>
    </div>
);
