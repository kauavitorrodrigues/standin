import {
    PART_GRID_TILE_SIZE,
    PART_GRID_GAP,
    PART_GRID_ROW_HEIGHT,
} from "../../consts/editor/grid";
import { getGridTemplate } from "../../utils/gridColumns";
import type { DraftPartChoice } from "../../types/draft";
import type { AvatarCategoryPartItem } from "../../types/editor";
import { PartCell } from "./PartCell";

type PartGridRowProps = {
    slot: string;
    items: readonly AvatarCategoryPartItem[];
    columns: number;
    // Where the row sits in the virtual list, in px from the top.
    offset: number;
    choice: DraftPartChoice | null;
    onChoose: (item: AvatarCategoryPartItem) => void;
    onRemove: () => void;
};

// One row of tiles of the virtual grid.
export const PartGridRow = ({
    slot,
    items,
    columns,
    offset,
    choice,
    onChoose,
    onRemove,
}: PartGridRowProps) => (
    <div
        className="absolute top-0 left-0 grid w-full"
        style={{
            height: PART_GRID_ROW_HEIGHT - PART_GRID_GAP,
            transform: `translateY(${offset}px)`,
            gridTemplateColumns: getGridTemplate(columns),
            gridTemplateRows: `${PART_GRID_TILE_SIZE}px`,
            justifyContent: "space-between",
            gap: PART_GRID_GAP,
        }}
    >
        {items.map((item) => {
            const isSelected = choice?.familyId === item.id;
            const variation =
                item.variations.find(
                    (entry) => isSelected && entry.id === choice?.partId
                ) ?? item.variations[0];
            return (
                <PartCell
                    key={item.id}
                    slot={slot}
                    item={item}
                    variation={variation}
                    isSelected={isSelected}
                    onChoose={onChoose}
                    onRemove={onRemove}
                />
            );
        })}
    </div>
);
