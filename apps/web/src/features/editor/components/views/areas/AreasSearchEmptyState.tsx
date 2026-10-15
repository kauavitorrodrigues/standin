import { PanelEmptyState } from "@/features/editor/components/views/panel/PanelEmptyState";

// The search matched no area.
export const AreasSearchEmptyState = () => (
    <PanelEmptyState
        title="Nenhuma área encontrada"
        message="Tente buscar por outro nome."
    />
);
