import type { AvatarSlot } from "@standin/contracts";
import { cn } from "@/lib/utils";
import type { AvatarEditorCategory } from "../../types/editor";
import { CategoryImage } from "./CategoryImage";

type CategoryTabProps = {
    category: AvatarEditorCategory;
    isActive: boolean;
    onSelect: (slot: AvatarSlot) => void;
};

export const CategoryTab = ({
    category,
    isActive,
    onSelect,
}: CategoryTabProps) => (
    <button
        type="button"
        aria-current={isActive}
        onClick={() => onSelect(category.slot)}
        className={cn(
            "flex shrink-0 items-center gap-3 rounded-lg px-3 py-1.5 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
            {
                "bg-blue-500/15 text-blue-600 dark:text-blue-400": isActive,
                "text-foreground hover:bg-muted": !isActive,
            }
        )}
    >
        <CategoryImage previewUrl={category.previewUrl} />
        <span className="truncate">{category.name}</span>
    </button>
);
