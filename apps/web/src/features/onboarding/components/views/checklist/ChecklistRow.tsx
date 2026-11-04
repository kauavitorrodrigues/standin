import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import type { ChecklistItem } from "../../../types/checklist";

type Props = { item: ChecklistItem; onSelect: () => void };

export const ChecklistRow = ({ item, onSelect }: Props) => (
    <li>
        <button
            type="button"
            data-done={item.isDone}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-foreground/10 data-[done=true]:text-muted-foreground"
            onClick={onSelect}
        >
            {item.isDone && <CheckCircle2Icon className="size-4 shrink-0" />}
            {!item.isDone && <CircleIcon className="size-4 shrink-0" />}
            {item.title}
        </button>
    </li>
);
