import type { LucideIcon } from "lucide-react";
import { ChevronRightIcon } from "lucide-react";

type Props = {
    icon: LucideIcon;
    title: string;
    description: string;
    onClick: () => void;
};

// One option of the type step: the icon, the name and one line about it.
export const KindOptionCard = ({
    icon: Icon,
    title,
    description,
    onClick,
}: Props) => (
    <button
        type="button"
        onClick={onClick}
        className="group bg-card hover:border-primary/60 hover:bg-muted/40 focus-visible:ring-ring flex items-center gap-4 rounded-xl border p-4 text-left outline-none transition-colors focus-visible:ring-2"
    >
        <span className="bg-muted text-muted-foreground group-hover:text-foreground flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors">
            <Icon className="size-6" strokeWidth={1.5} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-medium">{title}</span>
            <span className="text-muted-foreground text-sm">{description}</span>
        </span>
        <ChevronRightIcon className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors" />
    </button>
);
