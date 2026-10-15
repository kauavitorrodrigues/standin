import { PanelEmptyState } from "@/features/editor/components/views/panel/PanelEmptyState";

// The library has no area yet.
export const AreasEmptyState = () => (
    <PanelEmptyState
        title="Nenhuma área disponível"
        message="As áreas criadas na biblioteca aparecem aqui."
    />
);
