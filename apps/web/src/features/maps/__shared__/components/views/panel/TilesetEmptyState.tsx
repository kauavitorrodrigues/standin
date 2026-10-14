import { PanelEmptyState } from "@/features/maps/__shared__/components/views/panel/PanelEmptyState";

// A tileset where no tile has a category yet.
export const TilesetEmptyState = () => (
    <PanelEmptyState
        title="Nenhum tile marcado"
        message="Marque as categorias dos tiles no editor de tilesets para usá-los aqui."
    />
);
