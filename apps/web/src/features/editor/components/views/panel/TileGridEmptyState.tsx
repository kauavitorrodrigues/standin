import { PanelEmptyState } from "@/features/editor/components/views/panel/PanelEmptyState";

// A category with no tile in the tileset that is open.
export const TileGridEmptyState = () => (
    <PanelEmptyState
        title="Nenhum tile nesta categoria"
        message="Escolha outra categoria ou outro tileset."
    />
);
