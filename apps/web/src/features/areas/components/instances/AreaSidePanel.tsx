import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
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
import { AreaPropertiesDialog } from "../dialogs/AreaPropertiesDialog";
import { AreaTitleButton } from "../views/AreaTitleButton";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";
import { isRoomArea } from "../../utils/isRoomArea";
import type { AreaPalette } from "../../types/areaPalette";

type Props = {
    palette: AreaPalette;
    onExit: () => void;
};

// The left panel of the composer: the lists of objects and tiles, and under
// them the meter of objects. There is no tab of areas: an area has no area
// inside it. The name in the title opens the properties of the area.
export const AreaSidePanel = ({ palette, onExit }: Props) => {
    const store = useEditorStore();
    const open = useEditorSelector((state) => state.panelOpen);
    const panelTab = useEditorSelector((state) => state.panelTab);
    const [propertiesOpen, setPropertiesOpen] = useState(false);
    const { control } = useFormContext<AreaComposerFormValues>();
    const [createZone, zoneKind] = useWatch({
        control,
        name: ["createZone", "zoneKind"],
    });
    const areaIsRoom = isRoomArea({ createZone, zoneKind });

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
                    title={
                        <AreaTitleButton
                            onClick={() => setPropertiesOpen(true)}
                        />
                    }
                    onExit={onExit}
                >
                    <PanelToggle open={open} onToggle={store.togglePanel} />
                </SidePanelHeader>
                <PanelTabList withAreas={false} />
                <PanelTabs
                    palette={palette}
                    withAreas={false}
                    areaIsRoom={areaIsRoom}
                />
            </Tabs>
            <UsageFooter />
            <AreaPropertiesDialog
                open={propertiesOpen}
                onOpenChange={setPropertiesOpen}
            />
        </EditorLayout.Panel>
    );
};
