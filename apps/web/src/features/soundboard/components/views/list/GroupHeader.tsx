import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClipHeaderRow } from "../../../types/row";

type Props = { row: ClipHeaderRow; onToggle: () => void };

// The name of a group with the chevron that folds it.
export const GroupHeader = ({ row, onToggle }: Props) => (
    <button
        type="button"
        aria-expanded={row.isOpen}
        onClick={onToggle}
        className="flex h-full w-full items-center gap-1 rounded-md px-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
        <span className="truncate">{row.label}</span>
        <ChevronDownIcon
            className={cn(
                "size-3.5 shrink-0 transition-transform",
                !row.isOpen && "-rotate-90"
            )}
        />
    </button>
);
