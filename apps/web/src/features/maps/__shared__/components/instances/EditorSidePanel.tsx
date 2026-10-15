import type { ReactNode } from "react";
import { SidePanelHeader } from "@/features/editor/components/layout/SidePanelHeader";
import { PanelTitle } from "@/features/editor/components/views/PanelTitle";
import { Tabs } from "@/components/ui/tabs";
import { EditorLayout } from "@/features/editor/components/layout";
import { PanelTabList } from "@/features/editor/components/views/panel/PanelTabList";
import { PanelTabs } from "@/features/editor/components/views/panel/PanelTabs";
import { PanelToggle } from "@/features/editor/components/views/panel/PanelToggle";
import { UsageFooter } from "@/features/editor/components/views/panel/UsageFooter";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";
import { useEditorSelector } from "@/features/editor/hooks/useEditorSelector";
import { useMapPalette } from "@/features/assets/queries/useMapPalette";
import { fetchMapAreaStamp } from "@/features/maps/__shared__/utils/fetchMapAreaStamp";
import { useRequestExit } from "@/features/maps/__shared__/hooks/useRequestExit";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";

type EditorSidePanelProps = {
    mapId: string;
    title: string;
    // The name as the button that opens the menu of the owner of the map.
    actions?: ReactNode;
    onExit: () => void;
};

// The side panel. The title bar has the button that leaves and the name of the map
// (which opens its menu) on the left, and on the right the switch between objects, tiles and areas and the button
// that closes the panel.
export const EditorSidePanel = ({
    mapId,
    title,
    actions,
    onExit,
}: EditorSidePanelProps) => {
    const store = useEditorStore();
    const open = useEditorSelector((state) => state.panelOpen);
    const panelTab = useEditorSelector((state) => state.panelTab);
    const mapPalette = useMapPalette(mapId);
    const palette = {
        ...mapPalette,
        fetchAreaStamp: (areaId: string, version: number) =>
            fetchMapAreaStamp(mapId, areaId, version),
    };
    const requestExit = useRequestExit(onExit);

    return (
        <EditorLayout.Panel open={open}>
            <Tabs
                value={panelTab}
                onValueChange={(value) => {
                    switch (value) {
                        case PANEL_TABS.OBJECTS:
                        case PANEL_TABS.TILES:
                        case PANEL_TABS.AREAS:
                            store.setPanelTab(value);
                    }
                }}
                className="min-h-0 flex-1 gap-0"
            >
                <SidePanelHeader
                    title={<PanelTitle name={title} menu={actions} />}
                    onExit={requestExit}
                >
                    <PanelToggle open={open} onToggle={store.togglePanel} />
                </SidePanelHeader>
                <PanelTabList withAreas />
                <PanelTabs palette={palette} withAreas />
            </Tabs>
            <UsageFooter />
        </EditorLayout.Panel>
    );
};
