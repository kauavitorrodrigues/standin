import { XIcon } from "lucide-react";
import { ActiveFilterIcon } from "./ActiveFilterIcon";
import type { ActiveFilterChip as Chip } from "@/features/assets/types/activeFilterChip";

type Props = { chip: Chip; onRemove?: () => void };

export const ActiveFilterChip = ({
    chip: { title, label, icon: Icon },
    onRemove,
}: Props) => (
    <div className="bg-background inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border pr-1 pl-2 text-sm whitespace-nowrap">
        <ActiveFilterIcon icon={Icon} />
        <span className="text-muted-foreground">{title}</span>
        <span className="font-medium">{label}</span>
        <button
            type="button"
            aria-label={`Remover filtro ${title}`}
            onClick={onRemove}
            className="hover:bg-muted text-muted-foreground flex size-5 items-center justify-center rounded-sm"
        >
            <XIcon className="size-3.5" />
        </button>
    </div>
);
