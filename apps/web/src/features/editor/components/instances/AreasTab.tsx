import { useForm, useWatch } from "react-hook-form";
import type { LibraryPaletteArea } from "@standin/contracts";
import { PanelScroll } from "@/features/editor/components/layout/PanelScroll";
import { AreasBody } from "@/features/editor/components/views/areas/AreasBody";
import { SearchField } from "@/features/editor/components/views/SearchField";
import { AREA_PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { usePickArea } from "@/features/editor/hooks/usePickArea";
import type { EditorPalette } from "@/features/editor/types/editor-palette";
import { searchAreas } from "@/features/editor/utils/searchAreas";

type AreasTabProps = {
    palette: EditorPalette;
};

type SearchValues = { search: string };

// The library of areas. Picking one fetches its stamp and puts the editor in
// placing mode, and the pick stays highlighted until Esc, a click on it again
// or a change of tool cancels it. There is no management here, only placing.
export const AreasTab = ({ palette }: AreasTabProps) => {
    const store = useEditorStore();
    const placingId = useEditorSelector((state) => state.placingArea?.area.id);
    const pick = usePickArea(palette.fetchAreaStamp);
    const { register, control } = useForm<SearchValues>({
        defaultValues: { search: "" },
    });
    const search = useWatch({ control, name: "search" });

    const handlePick = (area: LibraryPaletteArea) => {
        // Picking the area that is already being placed turns the mode off.
        if (placingId === area.id) {
            store.cancelPlacingArea();
            return;
        }
        pick.mutate(area);
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
            <div className="px-3">
                <SearchField
                    {...register("search")}
                    placeholder="Buscar área"
                />
            </div>
            <PanelScroll>
                <AreasBody
                    areas={palette.areas}
                    visible={searchAreas(palette.areas, search)}
                    selectedId={placingId ?? null}
                    loadingId={pick.isPending ? pick.variables.id : null}
                    onPick={handlePick}
                />
                <AreaLoadError failed={pick.isError} />
            </PanelScroll>
        </div>
    );
};

type AreaLoadErrorProps = { failed: boolean };

const AreaLoadError = ({ failed }: AreaLoadErrorProps) => {
    if (!failed) return null;

    return (
        <p role="alert" className="text-destructive mt-2 text-xs">
            {AREA_PLACEMENT_MESSAGES.LOAD_FAILED}
        </p>
    );
};
