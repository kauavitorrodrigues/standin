import { ToolOptionsAnchor } from "@/features/editor/components/layout/ToolOptionsAnchor";
import { ToolOptionsPanel } from "@/features/editor/components/layout/ToolOptionsPanel";
import { ZoneKindToggles } from "@/features/editor/components/views/toolbar/ZoneKindToggles";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";

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
