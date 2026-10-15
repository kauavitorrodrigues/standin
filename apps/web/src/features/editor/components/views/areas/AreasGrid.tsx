import type { LibraryPaletteArea } from "@standin/contracts";
import { AreaCard } from "@/features/editor/components/views/areas/AreaCard";

type AreasGridProps = {
    areas: LibraryPaletteArea[];
    selectedId: string | null;
    loadingId: string | null;
    onPick: (area: LibraryPaletteArea) => void;
};

export const AreasGrid = ({
    areas,
    selectedId,
    loadingId,
    onPick,
}: AreasGridProps) => (
    <div className="grid grid-cols-2 gap-2">
        {areas.map((area) => (
            <AreaCard
                key={area.id}
                area={area}
                selected={selectedId === area.id}
                loading={loadingId === area.id}
                onPick={onPick}
            />
        ))}
    </div>
);
