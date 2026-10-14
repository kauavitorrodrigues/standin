import { TabsContent } from "@/components/ui/tabs";
import { ObjectsTab } from "@/features/editor/components/instances/ObjectsTab";
import { TilesTab } from "@/features/editor/components/instances/TilesTab";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";
import type { EditorPalette } from "@/features/editor/types/editor-palette";

type PanelTabsProps = {
    palette: EditorPalette;
};

// The two lists of the panel, with the palette it is given. The switch between
// them is in the title bar. The panel does not scroll: each list keeps its
// search and tabs at the top and scrolls only what is under them.
export const PanelTabs = ({ palette }: PanelTabsProps) => (
    <>
        <TabsContent
            value={PANEL_TABS.OBJECTS}
            className="flex min-h-0 flex-col"
        >
            <ObjectsTab palette={palette} />
        </TabsContent>
        <TabsContent value={PANEL_TABS.TILES} className="flex min-h-0 flex-col">
            <TilesTab palette={palette} />
        </TabsContent>
    </>
);
