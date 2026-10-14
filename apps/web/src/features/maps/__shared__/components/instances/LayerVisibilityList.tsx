import { EDITOR_LAYERS } from "@/features/maps/__shared__/consts/layers";
import { LayerVisibilityRow } from "@/features/maps/__shared__/components/views/panel/LayerVisibilityRow";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";

// The tile layers, from the top to the bottom. The eye shows or hides each one
// in the editor, and the eraser works on the ones that show.
export const LayerVisibilityList = () => {
    const store = useEditorStore();
    const visibility = useEditorSelector((state) => state.layerVisibility);

    return (
        <div className="flex flex-col gap-0.5" aria-label="Camadas">
            <span className="px-1 text-xs font-medium text-muted-foreground">
                Camadas
            </span>
            {EDITOR_LAYERS.map((layer) => (
                <LayerVisibilityRow
                    key={layer}
                    layer={layer}
                    visible={visibility[layer]}
                    onToggleVisible={store.toggleLayerVisible}
                />
            ))}
        </div>
    );
};
