import type { ReactNode } from "react";
import { useMapPalette } from "@/features/assets/queries/useMapPalette";
import { PanelEmptyState } from "@/features/maps/__shared__/components/views/panel/PanelEmptyState";
import { PanelLoadingState } from "@/features/maps/__shared__/components/views/panel/PanelLoadingState";
import { TilesPicker } from "@/features/maps/__shared__/components/instances/TilesPicker";

type TilesContentProps = {
    mapId: string;
    // Passed on to the picker.
    layers?: ReactNode;
};

// The tilesets of the map's library. It waits for the palette, then shows the
// picker, or says there is no tileset.
export const TilesContent = ({ mapId, layers }: TilesContentProps) => {
    const { tilesets, isLoading, isError } = useMapPalette(mapId);

    if (isLoading) {
        return (
            <div className="min-h-0 flex-1">
                <PanelLoadingState />
            </div>
        );
    }
    if (isError) {
        return (
            <div className="min-h-0 flex-1">
                <PanelEmptyState
                    title="Erro ao carregar"
                    message="Não foi possível carregar os tilesets da biblioteca."
                />
            </div>
        );
    }
    if (tilesets.length === 0) {
        return (
            <div className="min-h-0 flex-1">
                <PanelEmptyState
                    title="Nenhum tileset"
                    message="A biblioteca ainda não tem tilesets."
                />
            </div>
        );
    }

    return <TilesPicker tilesets={tilesets} layers={layers} />;
};
