import { cn } from "@/lib/utils";
import type { AvatarEditorBase } from "../../types/editor";
import { CategoryImage } from "./CategoryImage";

type BaseOptionProps = {
    base: AvatarEditorBase;
    isSelected: boolean;
    onSelect: () => void;
};

export const BaseOption = ({ base, isSelected, onSelect }: BaseOptionProps) => (
    <button
        type="button"
        aria-pressed={isSelected}
        onClick={onSelect}
        className={cn(
            "flex items-center gap-2 rounded-lg bg-muted/60 px-2 py-1 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
            { "ring-2 ring-blue-500": isSelected }
        )}
    >
        <CategoryImage previewUrl={base.previewUrl} />
        <span className="truncate">{base.name}</span>
    </button>
);
