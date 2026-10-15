import { TabsContent } from "@/components/ui/tabs";
import { ObjectsTab } from "@/features/editor/components/instances/ObjectsTab";
import { TilesTab } from "@/features/editor/components/instances/TilesTab";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";

type PanelTabsProps = {
    mapId: string;
};

// The two lists of the panel, with the library of the map. The switch between
// them is in the title bar. The panel does not scroll: each list keeps its
// search and tabs at the top and scrolls only what is under them.
export const PanelTabs = ({ mapId }: PanelTabsProps) => (
    <>
        <TabsContent
            value={PANEL_TABS.OBJECTS}
            className="flex min-h-0 flex-col"
        >
            <ObjectsTab mapId={mapId} />
        </TabsContent>
        <TabsContent value={PANEL_TABS.TILES} className="flex min-h-0 flex-col">
            <TilesTab mapId={mapId} />
        </TabsContent>
    </>
);
