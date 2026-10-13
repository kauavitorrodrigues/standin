import { useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { LibraryTilesetDetail } from "@standin/contracts";
import type { TilesetGridFormValues } from "../../types/gridForm";
import type { GridSuggestion, TileSheetGrid } from "../../types/sheet";
import { TilesetGridCustomFields } from "../fields/GridCustomFields";
import { getGridSuggestions } from "../../utils/grid/getGridSuggestions";
import { TilesetGridMismatch } from "../views/detail/grid/Mismatch";
import { TilesetGridHint } from "../views/detail/grid/Hint";
import { TilesetGridPicker } from "../views/detail/grid/Picker";
import { TilesetInfo } from "../views/detail/Info";

type Props = {
    tileset: LibraryTilesetDetail;
    // The grid the sheet shows: the typed margin and spacing, when they fit.
    grid: TileSheetGrid;
    form: UseFormReturn<TilesetGridFormValues>;
    // The grid the typed margin and spacing give, null when it does not fit.
    draftGrid: TileSheetGrid | null;
    changed: boolean;
    taggedCount: number;
    isSaving: boolean;
};

// The info of the tileset, with the margin and the spacing as inputs in it
// and the ways the image divides to pick from. The sheet shows the grid typed,
// and it is saved with the categories by the save of the editor.
export const TilesetGridForm = ({
    tileset,
    grid,
    form,
    draftGrid,
    changed,
    taggedCount,
    isSaving,
}: Props) => {
    // Only a tileset that no map paints with can change its grid, so only then
    // are there ways to pick for it, or margin and spacing to type.
    const editable = !tileset.inUse;
    const suggestions = editable
        ? getGridSuggestions({ w: tileset.widthPx, h: tileset.heightPx })
        : [];
    // The picker is open, and the fields to type are open in it.
    const [pickerOpen, setPickerOpen] = useState(false);
    const [typing, setTyping] = useState(false);
    const [margin, spacing] = useWatch({
        control: form.control,
        name: ["margin", "spacing"],
    });
    const pick = (suggestion: GridSuggestion) => {
        form.setValue("margin", suggestion.margin, { shouldDirty: true });
        form.setValue("spacing", suggestion.spacing, { shouldDirty: true });
    };

    return (
        <div className="flex flex-col gap-3">
            <TilesetInfo
                tileset={tileset}
                gridValue={
                    <div className="flex items-center justify-end gap-1">
                        <TilesetGridHint
                            show={changed}
                            fits={draftGrid !== null}
                        />
                        <TilesetGridPicker
                            suggestions={suggestions}
                            margin={margin}
                            spacing={spacing}
                            disabled={isSaving}
                            open={pickerOpen}
                            onOpenChange={setPickerOpen}
                            typing={typing}
                            onTypingChange={setTyping}
                            onPick={pick}
                            notice={
                                <TilesetGridMismatch
                                    show={draftGrid === null}
                                />
                            }
                            customFields={
                                editable ? (
                                    <TilesetGridCustomFields
                                        control={form.control}
                                        disabled={isSaving}
                                    />
                                ) : undefined
                            }
                        >
                            {grid.columns} × {grid.rows} ({grid.tileCount}{" "}
                            tiles)
                        </TilesetGridPicker>
                    </div>
                }
                grid={grid}
                taggedCount={taggedCount}
            />
        </div>
    );
};
