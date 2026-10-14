import { Tabs } from "@/components/ui/tabs";
import { EditorLayout } from "@/features/editor/components/layout";
import { SidePanelHeader } from "@/features/editor/components/layout/SidePanelHeader";
import { PanelTabList } from "@/features/editor/components/views/panel/PanelTabList";
import { PanelTabs } from "@/features/editor/components/views/panel/PanelTabs";
import { PanelToggle } from "@/features/editor/components/views/panel/PanelToggle";
import { UsageFooter } from "@/features/editor/components/views/panel/UsageFooter";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { AreaNameField } from "../forms/AreaNameField";
import { AreaZoneBox } from "../forms/AreaZoneBox";
import type { AreaPalette } from "../../types/areaPalette";

type Props = {
    palette: AreaPalette;
    onExit: () => void;
};

// The side panel of the composer. The name of the area is in the title bar, in
// the place of the title, and there is no tab of areas: an area has no area
// inside it. Under the lists, the box of the zone and the meter of objects.
export const AreaSidePanel = ({ palette, onExit }: Props) => {
    const store = useEditorStore();
    const open = useEditorSelector((state) => state.panelOpen);
    const panelTab = useEditorSelector((state) => state.panelTab);

    return (
        <EditorLayout.Panel open={open}>
            <Tabs
                value={panelTab}
                onValueChange={(value) => {
                    switch (value) {
                        case PANEL_TABS.OBJECTS:
                        case PANEL_TABS.TILES:
                            store.setPanelTab(value);
                    }
                }}
                className="min-h-0 flex-1 gap-0"
            >
                <SidePanelHeader title={<AreaNameField />} onExit={onExit}>
                    <PanelTabList withAreas={false} />
                    <PanelToggle open={open} onToggle={store.togglePanel} />
                </SidePanelHeader>
                <PanelTabs palette={palette} withAreas={false} />
            </Tabs>
            <AreaZoneBox />
            <UsageFooter />
        </EditorLayout.Panel>
    );
};
