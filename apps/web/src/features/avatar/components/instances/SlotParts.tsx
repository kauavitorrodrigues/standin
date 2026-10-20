import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { AvatarSlot } from "@standin/contracts";
import { useGridColumns } from "../../hooks/useGridColumns";
import { useCategoryPartsGrid } from "../../hooks/useCategoryPartsGrid";
import { usePartChoice } from "../../hooks/usePartChoice";
import type { AvatarEditorFormValues } from "../../types/draft";
import { moveTileFocus } from "../../utils/moveTileFocus";
import { findChosenFamily, isChoiceDeleted } from "../../utils/draft";
import { VariationSwatchesField } from "../fields/VariationSwatchesField";
import { EmptySlotNotice } from "../views/EmptySlotNotice";
import { NextPageRow } from "../views/NextPageRow";
import { PartGridError } from "../views/PartGridError";
import { PartGridRow } from "../views/PartGridRow";
import { PartGridSkeleton } from "../views/PartGridSkeleton";
import { DeletedPartRow } from "../views/DeletedPartRow";

type SlotPartsProps = { slot: AvatarSlot };

// The parts of one category. The list loads when the category opens, a page at
// a time while it is scrolled, and only the rows in view are mounted.
export const SlotParts = ({ slot }: SlotPartsProps) => {
    const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
        null
    );
    const columns = useGridColumns(scrollElement);
    const grid = useCategoryPartsGrid(slot, scrollElement, columns);
    const { control } = useFormContext<AvatarEditorFormValues>();
    const choice = useWatch({ control, name: `parts.${slot}` });
    const { choosePart, chooseVariation, removePart } = usePartChoice(slot);

    if (grid.isPending) return <PartGridSkeleton />;
    if (grid.isError) return <PartGridError onRetry={() => grid.refetch()} />;
    if (grid.items.length === 0) return <EmptySlotNotice isEmpty />;

    return (
        <>
            <DeletedPartRow
                isDeleted={isChoiceDeleted(
                    grid.items,
                    choice,
                    grid.isListComplete
                )}
                onRemove={removePart}
            />
            <div
                ref={setScrollElement}
                className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-muted p-4"
                onKeyDown={(event) => {
                    if (
                        moveTileFocus(event.currentTarget, event.key, columns)
                    ) {
                        event.preventDefault();
                    }
                }}
            >
                <div className="relative" style={{ height: grid.totalSize }}>
                    {grid.virtualRows.map((virtualRow) => {
                        const items = grid.rows[virtualRow.index];
                        if (!items) {
                            return (
                                <NextPageRow
                                    key="next-page"
                                    offset={virtualRow.start}
                                    columns={columns}
                                    isError={grid.isNextPageError}
                                    onRetry={() => void grid.fetchNextPage()}
                                />
                            );
                        }
                        return (
                            <PartGridRow
                                key={virtualRow.key}
                                items={items}
                                columns={columns}
                                offset={virtualRow.start}
                                choice={choice}
                                onChoose={choosePart}
                                onRemove={removePart}
                            />
                        );
                    })}
                </div>
            </div>
            <VariationSwatchesField
                family={findChosenFamily(grid.items, choice)}
                selectedId={choice?.partId ?? null}
                onSelect={chooseVariation}
            />
        </>
    );
};
