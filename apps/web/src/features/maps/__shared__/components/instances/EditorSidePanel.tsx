import type { ReactNode } from "react";
import { SidePanelHeader } from "@/components/editor/SidePanelHeader";
import { Tabs } from "@/components/ui/tabs";
import { EditorLayout } from "@/features/maps/__shared__/components/layout";
import { PanelTabList } from "@/features/maps/__shared__/components/views/panel/PanelTabList";
import { PanelTabs } from "@/features/maps/__shared__/components/views/panel/PanelTabs";
import { PanelToggle } from "@/features/maps/__shared__/components/views/panel/PanelToggle";
import { UsageFooter } from "@/features/maps/__shared__/components/views/panel/UsageFooter";
import { PANEL_TABS } from "@/features/maps/__shared__/consts/panelTabs";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";
import { useRequestExit } from "@/features/maps/__shared__/hooks/useRequestExit";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";

type EditorSidePanelProps = {
    mapId: string;
    title: string;
    // The menu of the owner of the map, beside the title.
    actions?: ReactNode;
    onExit: () => void;
};

// The side panel. The title bar has the button that leaves, the name of the map and
// its menu on the left, and on the right the switch between objects and tiles and the button
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
    const requestExit = useRequestExit(onExit);

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
                <SidePanelHeader
                    title={title}
                    actions={actions}
                    onExit={requestExit}
                >
                    <PanelTabList />
                    <PanelToggle open={open} onToggle={store.togglePanel} />
                </SidePanelHeader>
                <PanelTabs mapId={mapId} />
            </Tabs>
            <UsageFooter />
        </EditorLayout.Panel>
    );
};
