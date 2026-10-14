import type { ReactNode } from "react";
import { PanelEmptyState } from "@/features/editor/components/views/panel/PanelEmptyState";
import { PanelLoadingState } from "@/features/editor/components/views/panel/PanelLoadingState";
import { TilesPicker } from "@/features/editor/components/instances/TilesPicker";
import type { EditorPalette } from "@/features/editor/types/editor-palette";

type TilesContentProps = {
    palette: EditorPalette;
    // Passed on to the picker.
    layers?: ReactNode;
};

// The tilesets of the map's library. It waits for the palette, then shows the
// picker, or says there is no tileset.
export const TilesContent = ({ palette, layers }: TilesContentProps) => {
    const { tilesets, isLoading, isError } = palette;

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
