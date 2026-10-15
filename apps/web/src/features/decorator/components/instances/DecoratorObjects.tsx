import { ObjectsTab } from "@/features/editor/components/instances/ObjectsTab";
import { PanelEmptyState } from "@/features/editor/components/views/panel/PanelEmptyState";
import { PanelLoadingState } from "@/features/editor/components/views/panel/PanelLoadingState";
import { useMapPalette } from "@/features/assets/queries/useMapPalette";
import { PALETTE_LOOKS } from "@/features/assets/consts/paletteLooks";

type DecoratorObjectsProps = {
    mapId: string;
};

// The library of the decorator: every object the space may use, as the editor
// lists them (tabs by category, search), with only the pictures. Picking one,
// or dragging it out, starts placing it.
export const DecoratorObjects = ({ mapId }: DecoratorObjectsProps) => {
    const palette = useMapPalette(mapId);

    if (palette.isLoading) return <PanelLoadingState />;
    if (palette.isError) {
        return (
            <PanelEmptyState
                title="Não foi possível carregar a biblioteca"
                message="Feche o decorator e abra de novo."
            />
        );
    }

    return (
        <ObjectsTab
            palette={palette}
            look={PALETTE_LOOKS.DECORATOR}
            searchPlaceholder="Buscar decoração"
        />
    );
};
