import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
    AvatarCategoryPartItem,
    AvatarCategoryPartVariation,
} from "../../types/editor";
import { PART_GRID_TILE_SIZE } from "../../consts/editor/grid";
import { AVATAR_TEST_IDS } from "../../utils/avatarTestIds";
import { PartTileImage } from "./PartTileImage";

type PartCellProps = {
    slot: string;
    item: AvatarCategoryPartItem;
    // The color shown in the tile: the chosen one when this part is selected,
    // the first one otherwise.
    variation: AvatarCategoryPartVariation;
    isSelected: boolean;
    onChoose: (item: AvatarCategoryPartItem) => void;
    onRemove: () => void;
};

type RemoveMarkProps = { isSelected: boolean; onRemove: () => void };

const RemoveMark = ({ isSelected, onRemove }: RemoveMarkProps) => {
    if (!isSelected) return null;

    return (
        <button
            type="button"
            aria-label="Remover peça"
            onClick={onRemove}
            className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full bg-blue-500 text-white outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
            <XIcon className="size-3" />
        </button>
    );
};

export const PartCell = ({
    slot,
    item,
    variation,
    isSelected,
    onChoose,
    onRemove,
}: PartCellProps) => (
    <div
        className="relative"
        style={{ width: PART_GRID_TILE_SIZE, height: PART_GRID_TILE_SIZE }}
    >
        <Tooltip>
            <TooltipTrigger
                render={
                    <button
                        type="button"
                        data-part-tile=""
                        data-testid={AVATAR_TEST_IDS.part(slot, item.name)}
                        aria-label={item.name}
                        aria-pressed={isSelected}
                        onClick={() => onChoose(item)}
                        className={cn(
                            "flex size-full items-center justify-center overflow-hidden rounded-md p-4 outline-none transition-colors hover:bg-background/40 focus-visible:ring-2 focus-visible:ring-ring/50",
                            { "ring-2 ring-blue-500": isSelected }
                        )}
                    />
                }
            >
                <PartTileImage variation={variation} />
            </TooltipTrigger>
            <TooltipContent>{item.name}</TooltipContent>
        </Tooltip>
        <RemoveMark isSelected={isSelected} onRemove={onRemove} />
    </div>
);
