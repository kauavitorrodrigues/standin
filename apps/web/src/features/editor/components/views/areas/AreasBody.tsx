import type { LibraryPaletteArea } from "@standin/contracts";
import { AreasEmptyState } from "@/features/editor/components/views/areas/AreasEmptyState";
import { AreasGrid } from "@/features/editor/components/views/areas/AreasGrid";
import { AreasSearchEmptyState } from "@/features/editor/components/views/areas/AreasSearchEmptyState";

type AreasBodyProps = {
    areas: LibraryPaletteArea[];
    visible: LibraryPaletteArea[];
    selectedId: string | null;
    loadingId: string | null;
    onPick: (area: LibraryPaletteArea) => void;
};

// What the tab shows under the search: the cards, or the reason there are none.
export const AreasBody = ({
    areas,
    visible,
    selectedId,
    loadingId,
    onPick,
}: AreasBodyProps) => {
    if (areas.length === 0) return <AreasEmptyState />;
    if (visible.length === 0) return <AreasSearchEmptyState />;

    return (
        <AreasGrid
            areas={visible}
            selectedId={selectedId}
            loadingId={loadingId}
            onPick={onPick}
        />
    );
};
