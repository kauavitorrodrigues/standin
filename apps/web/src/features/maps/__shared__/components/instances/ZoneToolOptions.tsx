import { ToolOptionsAnchor } from "@/components/editor/ToolOptionsAnchor";
import { ToolOptionsPanel } from "@/components/editor/ToolOptionsPanel";
import { ZoneKindToggles } from "@/features/maps/__shared__/components/views/toolbar/ZoneKindToggles";
import { EDITOR_TOOLS } from "@/features/maps/__shared__/consts/tools";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";

// The mode of the zone tool, beside the tool rail while the tool is in use.
export const ZoneToolOptions = () => {
    const store = useEditorStore();
    const tool = useEditorSelector((state) => state.tool);
    const zoneKind = useEditorSelector((state) => state.zoneKind);

    return (
        <ToolOptionsAnchor anchorId={EDITOR_TOOLS.ZONE}>
            <ToolOptionsPanel open={tool === EDITOR_TOOLS.ZONE}>
                <ZoneKindToggles
                    zoneKind={zoneKind}
                    onZoneKindChange={store.setZoneKind}
                />
            </ToolOptionsPanel>
        </ToolOptionsAnchor>
    );
};
